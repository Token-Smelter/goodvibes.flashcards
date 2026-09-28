const PREFIX = "goodvibes.flashcards/progress/v1/";

export function emptyProgress() {
  return { cards: Object.create(null) };
}

export function readProgress(stackId, storage) {
  try {
    const saved = JSON.parse(storage.getItem(PREFIX + stackId));
    if (!saved || typeof saved !== "object" || !saved.cards || typeof saved.cards !== "object") {
      return emptyProgress();
    }
    const progress = emptyProgress();
    for (const [id, counts] of Object.entries(saved.cards)) {
      if (!counts || typeof counts !== "object") continue;
      progress.cards[id] = {
        correct: validCount(counts.correct),
        incorrect: validCount(counts.incorrect)
      };
    }
    return progress;
  } catch {
    return emptyProgress();
  }
}

function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function saveProgress(stackId, progress, storage) {
  try {
    storage.setItem(PREFIX + stackId, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function recordGrade(progress, cardId, correct) {
  const counts = progress.cards[cardId] ?? { correct: 0, incorrect: 0 };
  progress.cards[cardId] = {
    correct: counts.correct + Number(correct),
    incorrect: counts.incorrect + Number(!correct)
  };
}

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function createQueue(stack, progress, random = Math.random) {
  const debt = (card) => {
    const counts = progress.cards[card.id] ?? { correct: 0, incorrect: 0 };
    return Math.max(0, counts.incorrect - counts.correct);
  };
  const ordered = shuffle([...stack.cards], random).sort((a, b) => debt(b) - debt(a));
  const repeats = ordered.flatMap((card) => Array(Math.min(2, debt(card))).fill(card.id));
  return [...ordered.map((card) => card.id), ...shuffle(repeats, random)];
}

export function requeueIncorrect(queue, cardId) {
  queue.splice(Math.min(2, queue.length), 0, cardId);
}
