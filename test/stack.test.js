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
  stack.format = "goodvibes.flashcards/stack-v3";
  assert.throws(() => parseStack(JSON.stringify(stack)), /stack.format/);
});

test("parseStack_v2DomainPaths_acceptsHierarchy", () => {
  const stack = sample();
  stack.format = "goodvibes.flashcards/stack-v2";
  stack.cards[0].domains = [["Mathematics", "Exponents"], ["Machine Learning", "Softmax"]];
  assert.equal(parseStack(JSON.stringify(stack)).cards[0].domains.length, 2);
});

test("validateStack_v2MissingDomain_rejectsCard", () => {
  const stack = sample();
  stack.format = "goodvibes.flashcards/stack-v2";
  assert.match(validateStack(stack).join("\n"), /domains/);
});

test("validateStack_v1DomainExtension_rejectsVersionDrift", () => {
  const stack = sample();
  stack.cards[0].domains = [["Mathematics"]];
  assert.match(validateStack(stack).join("\n"), /unknown field/);
});

test("validateStack_duplicateDomainPath_rejectsAmbiguousMembership", () => {
  const stack = sample();
  stack.format = "goodvibes.flashcards/stack-v2";
  stack.cards[0].domains = [["Mathematics"], ["Mathematics"]];
  assert.match(validateStack(stack).join("\n"), /duplicate domain path/);
});

test("validateStack_emptyDomainSegment_rejectsBrokenHierarchy", () => {
  const stack = sample();
  stack.format = "goodvibes.flashcards/stack-v2";
  stack.cards[0].domains = [["Machine Learning", "  "]];
  assert.match(validateStack(stack).join("\n"), /character label/);
});

test("validateStack_blankAnswer_rejectsCard", () => {
  const stack = sample();
  stack.cards[0].back.html = "   ";
  assert.match(validateStack(stack).join("\n"), /back.html/);
});

test("parseStack_oversizeInput_rejectsImport", () => {
  assert.throws(() => parseStack(" ".repeat(10 * 1024 * 1024 + 1)), /10 MiB/);
});
