import test from "node:test";
import assert from "node:assert/strict";
import { createQueue, emptyProgress, readProgress, recordGrade, requeueIncorrect, saveProgress } from "../site/lib/review.js";

const stack = { cards: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }] };
const storage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
};

test("createQueue_priorMisses_addsLaterReviewSlots", () => {
  const progress = emptyProgress();
  progress.cards.a = { correct: 0, incorrect: 2 };
  assert.equal(createQueue(stack, progress, () => 0.5).filter((id) => id === "a").length, 3);
});

test("createQueue_recoveredCard_removesExtraSlots", () => {
  const progress = emptyProgress();
  progress.cards.a = { correct: 2, incorrect: 2 };
  assert.equal(createQueue(stack, progress, () => 0.5).filter((id) => id === "a").length, 1);
});

test("requeueIncorrect_wrongGrade_returnsAfterTwoOtherCards", () => {
  const queue = ["b", "c", "d"];
  requeueIncorrect(queue, "a");
  assert.deepEqual(queue, ["b", "c", "a", "d"]);
});

test("saveProgress_reimportedStack_retainsCountsByStableId", () => {
  const store = storage();
  const progress = emptyProgress();
  recordGrade(progress, "a", false);
  saveProgress("math.notation", progress, store);
  assert.equal(readProgress("math.notation", store).cards.a.incorrect, 1);
});

test("readProgress_changedStackId_doesNotLeakCounts", () => {
  const store = storage();
  const progress = emptyProgress();
  recordGrade(progress, "a", false);
  saveProgress("math.notation", progress, store);
  assert.equal(readProgress("logic.notation", store).cards.a, undefined);
});

test("saveProgress_blockedStorage_continuesSession", () => {
  const blocked = { setItem() { throw new Error("blocked"); } };
  assert.equal(saveProgress("math.notation", emptyProgress(), blocked), false);
});
