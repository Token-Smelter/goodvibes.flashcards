import test from "node:test";
import assert from "node:assert/strict";
import { faceDocument, showFace } from "../site/lib/face.js";

test("faceDocument_richContent_placesResourcePolicyBeforeUserMarkup", () => {
  const document = faceDocument("<script>console.log('card')</script>");
  assert.ok(document.indexOf("Content-Security-Policy") < document.indexOf("console.log('card')"));
});

test("showFace_interactiveMarkup_usesOpaqueOriginSandbox", () => {
  const originalDocument = globalThis.document;
  const attributes = new Map();
  globalThis.document = { createElement: () => ({ setAttribute: (name, value) => attributes.set(name, value) }) };
  try {
    showFace({ replaceChildren() {} }, "<p>Question</p>", "front");
    assert.equal(attributes.get("sandbox"), "allow-scripts");
  } finally {
    globalThis.document = originalDocument;
  }
});
