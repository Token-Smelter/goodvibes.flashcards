export const FORMAT = "goodvibes.flashcards/stack-v1";
export const MAX_STACK_BYTES = 10 * 1024 * 1024;

const ID = /^[a-z0-9][a-z0-9._-]{1,79}$/;

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function keys(value, allowed, path, errors) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key}: unknown field`);
  }
}

function id(value, path, errors) {
  if (typeof value !== "string" || !ID.test(value)) {
    errors.push(`${path}: expected 2–80 lowercase letters, digits, dots, underscores or hyphens, starting with a letter or digit`);
  }
}

function text(value, path, max, errors) {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    errors.push(`${path}: expected non-empty text (at most ${max} characters)`);
  }
}

function face(value, path, errors) {
  if (!object(value)) {
    errors.push(`${path}: expected an object with an html field`);
    return;
  }
  keys(value, ["html"], path, errors);
  text(value.html, `${path}.html`, 500000, errors);
}

export function validateStack(stack) {
  const errors = [];
  if (!object(stack)) return ["stack: expected an object"];
  keys(stack, ["format", "id", "title", "cards"], "stack", errors);
  if (stack.format !== FORMAT) errors.push(`stack.format: expected ${FORMAT}`);
  id(stack.id, "stack.id", errors);
  text(stack.title, "stack.title", 120, errors);

  if (!Array.isArray(stack.cards) || stack.cards.length < 1 || stack.cards.length > 5000) {
    errors.push("stack.cards: expected between 1 and 5000 cards");
    return errors;
  }

  const seen = new Set();
  stack.cards.forEach((card, index) => {
    const path = `stack.cards[${index}]`;
    if (!object(card)) {
      errors.push(`${path}: expected a card object`);
      return;
    }
    keys(card, ["id", "front", "back", "tags", "source"], path, errors);
    id(card.id, `${path}.id`, errors);
    if (seen.has(card.id)) errors.push(`${path}.id: duplicate card ID ${String(card.id)}`);
    seen.add(card.id);
    face(card.front, `${path}.front`, errors);
    face(card.back, `${path}.back`, errors);

    if (card.tags !== undefined) {
      if (!Array.isArray(card.tags) || card.tags.length > 20) {
        errors.push(`${path}.tags: expected at most 20 tags`);
      } else {
        const tags = new Set();
        card.tags.forEach((tag, tagIndex) => {
          id(tag, `${path}.tags[${tagIndex}]`, errors);
          if (tags.has(tag)) errors.push(`${path}.tags[${tagIndex}]: duplicate tag`);
          tags.add(tag);
        });
      }
    }
    if (card.source !== undefined) text(card.source, `${path}.source`, 500, errors);
  });
  return errors;
}

export function parseStack(source) {
  if (new TextEncoder().encode(source).length > MAX_STACK_BYTES) {
    throw new Error("Stack exceeds the 10 MiB import limit.");
  }
  let stack;
  try {
    stack = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
  const errors = validateStack(stack);
  if (errors.length) throw new Error(errors.join("\n"));
  return stack;
}
