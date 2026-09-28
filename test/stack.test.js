import test from "node:test";
import assert from "node:assert/strict";
import { parseStack, validateStack } from "../site/lib/stack.js";

const sample = () => ({
  format: "goodvibes.flashcards/stack-v1",
  id: "math.notation",
  title: "Math notation",
  cards: [{ id: "parabola", front: { html: "<math><mi>x</mi></math>" }, back: { html: "<svg aria-label='curve'></svg>" } }]
});

test("parseStack_validRichFaces_acceptsHtmlMathAndSvg", () => {
  assert.equal(parseStack(JSON.stringify(sample())).cards[0].id, "parabola");
});

test("validateStack_duplicateCardId_rejectsStack", () => {
  const stack = sample();
  stack.cards.push({ ...stack.cards[0] });
  assert.match(validateStack(stack).join("\n"), /duplicate card ID/);
});

test("validateStack_unknownField_rejectsUnversionedExtension", () => {
  const stack = sample();
  stack.cards[0].template = "essay";
  assert.match(validateStack(stack).join("\n"), /unknown field/);
});

test("parseStack_wrongFormat_rejectsUnsupportedVersion", () => {
  const stack = sample();
  stack.format = "goodvibes.flashcards/stack-v2";
  assert.throws(() => parseStack(JSON.stringify(stack)), /stack.format/);
});

test("validateStack_blankAnswer_rejectsCard", () => {
  const stack = sample();
  stack.cards[0].back.html = "   ";
  assert.match(validateStack(stack).join("\n"), /back.html/);
});

test("parseStack_oversizeInput_rejectsImport", () => {
  assert.throws(() => parseStack(" ".repeat(10 * 1024 * 1024 + 1)), /10 MiB/);
});
