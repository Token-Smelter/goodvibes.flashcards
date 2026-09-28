#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseStack, MAX_STACK_BYTES } from "../site/lib/stack.js";

const paths = process.argv.slice(2);
if (!paths.length) {
  console.error("Usage: node scripts/validate-stack.mjs <stack.json> [more stacks...] ");
  process.exitCode = 2;
} else {
  for (const path of paths) {
    try {
      const source = await readFile(path);
      if (source.byteLength > MAX_STACK_BYTES) throw new Error("Stack exceeds the 10 MiB import limit.");
      const stack = parseStack(source.toString("utf8"));
      console.log(`${path}: valid (${stack.cards.length} cards)`);
    } catch (error) {
      console.error(`${path}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
