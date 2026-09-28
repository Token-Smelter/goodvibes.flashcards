---
api_version: sourcerer.project/v2
kind: project
id: goodvibes-flashcards
name: goodvibes.flashcards
summary: >-
  Public static flashcard player with a versioned agent-editable stack format,
  sandboxed rich card faces, and browser-local review history.
type: application

protected_refs:
  - main

lineage:
  default_provider:
    id: git
    version: "1.0"
  providers:
    - id: git
      version: "1.0"
      config:
        remote: origin
        upstream_ref: main
        worktree_layout: nested
        worktree_root: /home/mike/development/miscellaneous/flash-cards

grounding:
  - description: Versioned format and review behavior
    path: README.md
  - description: JSON Schema for v1 stacks
    path: schemas/stack-v1.schema.json

agent_source:
  kind: registered_checkout

capabilities:
  - type: code-edit
    version: "1.0"
    description: >-
      Change the static flashcard player, stack validator, rendering isolation,
      or review algorithm; private flashcard content belongs in flashcard-stack.
    domains:
      - flashcards
      - frontend
    tags:
      - javascript
      - static-web
      - local-first

  - type: stack-format
    version: "1.0"
    description: >-
      Own the public goodvibes.flashcards/stack-v1 schema, parser, examples,
      and agent-facing format documentation. New personal cards belong in the
      private flashcard-stack project instead.
    domains:
      - flashcards
    tags:
      - schema
      - json
      - html

entrypoints:
  repo_root: "."
  test: "npm test && npm run validate"
---

# goodvibes.flashcards

A static player, not the home for personal card content. Import a local stack
file, review in a browser, and keep progress in localStorage. See `README.md`
for the format and security boundary.
