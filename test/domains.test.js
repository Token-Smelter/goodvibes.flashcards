import test from "node:test";
import assert from "node:assert/strict";
import { domainPaths, selectCards } from "../site/lib/domains.js";

const cards = [
  { id: "exponents", domains: [["Mathematics", "Exponents"], ["Machine Learning", "Softmax"]] },
  { id: "logits", domains: [["Machine Learning", "Classification", "Logits"]] },
  { id: "calibration", domains: [["Machine Learning", "Classification", "Calibration"]] }
];

test("domainPaths_nestedCards_exposesAncestorAreas", () => {
  assert.deepEqual(domainPaths(cards).filter((path) => path[0] === "Machine Learning"), [
    ["Machine Learning"],
    ["Machine Learning", "Classification"],
    ["Machine Learning", "Classification", "Calibration"],
    ["Machine Learning", "Classification", "Logits"],
    ["Machine Learning", "Softmax"]
  ]);
});

test("selectCards_parentArea_includesEveryDescendantOnce", () => {
  assert.deepEqual(selectCards(cards, [["Machine Learning"]]).map((card) => card.id), ["exponents", "logits", "calibration"]);
});

test("selectCards_twoSubareas_combinesWithoutDuplicates", () => {
  assert.deepEqual(selectCards(cards, [["Mathematics"], ["Machine Learning", "Softmax"]]).map((card) => card.id), ["exponents"]);
});

test("selectCards_legacyV1_groupsUnderUnsorted", () => {
  assert.deepEqual(selectCards([{ id: "old" }, ...cards], [["Unsorted"]]).map((card) => card.id), ["old"]);
});

test("selectCards_noSelection_includesWholeStack", () => {
  assert.equal(selectCards(cards, []).length, cards.length);
});
