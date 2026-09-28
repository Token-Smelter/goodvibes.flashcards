import { MAX_STACK_BYTES, parseStack } from "./lib/stack.js";
import { createQueue, emptyProgress, readProgress, recordGrade, requeueIncorrect, saveProgress } from "./lib/review.js";
import { showFace } from "./lib/face.js";

const $ = (id) => document.getElementById(id);
const ui = {
  file: $("stack-file"), import: $("import-button"), title: $("stack-title"), description: $("stack-description"),
  origin: $("stack-origin"), notice: $("notice"), mount: $("face-mount"), side: $("face-side"),
  identity: $("card-identity"), pending: $("pending-count"), answered: $("answered-count"),
  missed: $("missed-count"), source: $("answer-source"), hint: $("decision-hint"),
  reveal: $("reveal-button"), grades: $("grade-controls"), again: $("again-button"),
  correct: $("correct-button"), restart: $("restart-button"), announce: $("announcement")
};

let storage;
try {
  storage = window.localStorage;
} catch {
  storage = null;
}

const state = {
  stack: null,
  cards: new Map(),
  progress: emptyProgress(),
  queue: [],
  current: null,
  revealed: false,
  answered: 0,
  missed: 0
};

function notice(message) {
  ui.notice.textContent = message;
  ui.notice.hidden = !message;
}

function updateCounts() {
  ui.pending.textContent = String(state.queue.length + Number(Boolean(state.current)));
  ui.answered.textContent = String(state.answered);
  ui.missed.textContent = String(state.missed);
  ui.missed.classList.toggle("has-misses", state.missed > 0);
}

function renderSource(source) {
  ui.source.replaceChildren();
  ui.source.hidden = !source;
  if (!source) return;
  ui.source.append("Source · ");
  try {
    const url = new URL(source);
    if (url.protocol === "https:" || url.protocol === "http:") {
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = source;
      ui.source.append(link);
      return;
    }
  } catch { /* A bibliographic reference can be plain text. */ }
  ui.source.append(source);
}

function nextCard() {
  const id = state.queue.shift();
  state.current = id ? state.cards.get(id) : null;
  state.revealed = false;
  ui.mount.classList.remove("is-answer");
  ui.source.hidden = true;
  ui.grades.hidden = true;
  ui.reveal.hidden = Boolean(!state.current);
  ui.restart.hidden = Boolean(state.current);
  ui.reveal.disabled = !state.current;
  updateCounts();

  if (!state.current) {
    ui.side.textContent = "Session complete";
    ui.identity.textContent = `${state.answered} answers recorded`;
    ui.mount.replaceChildren();
    const message = document.createElement("div");
    message.className = "completion";
    message.textContent = "All prompts reviewed. Come back whenever you want another pass.";
    ui.mount.append(message);
    ui.hint.textContent = "Your counts are saved in this browser.";
    ui.announce.textContent = "Session complete. All prompts reviewed.";
    ui.restart.focus();
    return;
  }

  ui.side.textContent = "Prompt";
  ui.identity.textContent = `Turn ${state.answered + 1} · ${state.current.tags?.join(" / ") || "general"}`;
  ui.hint.textContent = "Take a moment before revealing.";
  showFace(ui.mount, state.current.front.html, "front");
  ui.announce.textContent = `Prompt ${state.answered + 1}. ${state.queue.length + 1} turns remaining.`;
  ui.reveal.focus();
}

function startSession() {
  if (!state.stack) return;
  state.queue = createQueue(state.stack, state.progress);
  state.answered = 0;
  state.missed = 0;
  nextCard();
}

function loadStack(stack, label) {
  state.stack = stack;
  state.cards = new Map(stack.cards.map((card) => [card.id, card]));
  state.progress = readProgress(stack.id, storage);
  ui.title.textContent = stack.title;
  ui.description.textContent = `${stack.cards.length} cards · recall first, then check your answer.`;
  ui.origin.textContent = label;
  notice("");
  startSession();
}

function reveal() {
  if (!state.current || state.revealed) return;
  state.revealed = true;
  ui.side.textContent = "Answer";
  ui.mount.classList.add("is-answer");
  showFace(ui.mount, state.current.back.html, "back");
  renderSource(state.current.source);
  ui.reveal.hidden = true;
  ui.grades.hidden = false;
  ui.hint.textContent = "How did your answer compare?";
  ui.announce.textContent = "Answer revealed. Mark whether you got it right.";
  ui.again.focus();
}

function grade(correct) {
  if (!state.current || !state.revealed) return;
  recordGrade(state.progress, state.current.id, correct);
  if (!correct) {
    requeueIncorrect(state.queue, state.current.id);
    state.missed++;
  }
  state.answered++;
  if (!saveProgress(state.stack.id, state.progress, storage)) {
    notice("Browser storage is unavailable. You can continue this session, but grades will not survive a reload.");
  }
  nextCard();
}

async function importFile() {
  const file = ui.file.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_STACK_BYTES) throw new Error("Stack exceeds the 10 MiB import limit.");
    loadStack(parseStack(await file.text()), `Imported · ${file.name}`);
  } catch (error) {
    notice(`Could not import ${file.name}: ${error.message}\nCheck the v1 stack format, then try again.`);
  } finally {
    ui.file.value = "";
  }
}

ui.import.addEventListener("click", () => ui.file.click());
ui.file.addEventListener("change", importFile);
ui.reveal.addEventListener("click", reveal);
ui.again.addEventListener("click", () => grade(false));
ui.correct.addEventListener("click", () => grade(true));
ui.restart.addEventListener("click", startSession);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("input, textarea, select, [contenteditable='true']")) return;
  if ((event.code === "Space" || event.key === " ") && !event.target.closest("button, a") && !state.revealed && state.current) {
    event.preventDefault();
    reveal();
  } else if (event.key === "ArrowLeft" && state.revealed) {
    event.preventDefault();
    grade(false);
  } else if (event.key === "ArrowRight" && state.revealed) {
    event.preventDefault();
    grade(true);
  }
});

try {
  const response = await fetch("./demo.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  loadStack(parseStack(await response.text()), "Public demo stack");
} catch (error) {
  ui.title.textContent = "Bring a stack to begin";
  ui.description.textContent = "Import a local JSON stack. The demo could not be loaded.";
  ui.identity.textContent = "No card loaded";
  ui.mount.textContent = "Choose Import stack to get started.";
  ui.pending.textContent = "0";
  notice(`The bundled demo did not load: ${error.message}. You can still import your own stack.`);
}
