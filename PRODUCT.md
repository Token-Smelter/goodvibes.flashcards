# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: a dependency-free static web app using browser APIs, chosen for direct S3 and CloudFront deployment without a server or build step. GitHub hosts the public platform at `Token-Smelter/goodvibes.flashcards`.

## Users

A learner imports their own card stacks and practices domain knowledge, including mathematical notation, symbolic logic, and code. An agent can author stacks in a separate repository on the learner's behalf.

## Product Purpose

Render domain-independent front and back content, reveal answers, collect self-graded correct/incorrect responses, and revisit incorrect cards more frequently. Success means an agent can add a valid card to a private stack and the learner can import and review it without a server or account.

## Positioning

The review app and the content repo are deliberately separate: versioned, agent-editable stack files carry arbitrary rich card faces; browser-local review history never leaves the learner's device.

## Operating Context

The public player is intended for static delivery through S3 and CloudFront. A private card-stack repository at `mikewrather/flashcard-stack` stores authoring files. The user manually imports a stack file into the browser; the player must not require browser access to a private GitHub repository.

## Capabilities and Constraints

- A card has independently authored front and back faces that may contain HTML, MathML, SVG, and media.
- Interactive card JavaScript is permitted only within a sandboxed, opaque-origin face frame; it must not have access to app storage or parent DOM. Untrusted code can still disrupt its own frame; review provenance before importing a stack.
- Review correctness and revisit priority are stored in browser localStorage, not sent to a server.
- Accounts, cross-device sync, and a remote content API are not required for this first version.
- The exact schema and scheduling algorithm are implementation decisions for the first version, not confirmed long-term commitments.

## Evidence on Hand

The initial examples are math, logic, and code prompts from the request; they are illustrative, not a claimed personal curriculum. Anki's notes, cards, and deck distinction is useful prior art, but does not constrain this player's initial card model: https://docs.ankiweb.net/getting-started.html#key-concepts.

## Product Principles

- Files are the authoring API; a session can add cards without driving a UI.
- Keep learner state out of Git and keep private card content out of the public player repository.
- Preserve card identity across edits so progress survives re-import.
- Keep a review session intelligible: one prompt, reveal, self-grade, then next prompt.
