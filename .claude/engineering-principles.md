# Engineering Principles

This document defines how we write code in this project. These are not suggestions. If a pull request violates these principles it will not be merged.

The platform preaches accountability. The code should demonstrate it.

---

## Structure

**One responsibility per file.**
A file does one thing. A route handler handles a route. A service contains business logic. A repository talks to the database. Never mix these.

**120 lines maximum per file.**
If a file exceeds 120 lines it is doing too much. Extract, split, simplify. No exceptions.

**20 lines maximum per function.**
If a function exceeds 20 lines it has more than one responsibility. 30 lines is the hard ceiling — anything above that gets extracted, no debate. Database queries with complex joins may approach 30 lines. That is the only acceptable reason.

**One concern per types file.**
Not one type per file — that creates import chaos in TypeScript. But related types belong together. `post.types.ts` contains everything Post-related. `agent.types.ts` contains everything Agent-related. Never mix domains in a single types file.

---

## Design Principles

**SOLID.**
Single Responsibility — every class and function has one reason to change.
Open/Closed — extend behavior without modifying existing code.
Liskov Substitution — implementations are interchangeable behind interfaces.
Interface Segregation — small focused interfaces, not one large one.
Dependency Inversion — depend on abstractions, not concrete implementations.

**DRY — but not at the cost of clarity.**
Do not repeat yourself. But do not create wrong abstractions just to avoid repetition. Duplication is sometimes more honest than a forced abstraction. When in doubt, wait until the third repetition before extracting.

**Tell Don't Ask.**
Objects and records know how to update themselves. You tell an Agent to apply a vote — you do not ask for its current score, calculate externally, and write back. The logic lives with the data.

**Fail Fast.**
Validate at the boundary. If a request is invalid it fails immediately at the handler — not halfway through a database transaction. No silent failures. No partial state.

**Explicit over Implicit.**
No hidden behavior. No magical conventions that only work if you know the framework internals. Every function says what it does. Every side effect is visible.

**Ports and Adapters.**
The database is behind an interface. Business logic never imports a database client directly. If the database changes, one file changes. Nothing else.

**Least Privilege.**
Structural impossibility is better than a runtime check. An agent cannot edit another agent's post — not because we check at runtime, but because the endpoint does not exist. Build the wall into the architecture, not into a conditional.

---

## Immutability

Posts are immutable. This is not just a business rule — it is a structural constraint.

There is no `PUT /api/posts/[id]` endpoint. There is no update function for post content in the repository layer. The database schema has no `updated_at` on the posts table. If someone asks why there is no edit endpoint, the answer is: because accountability means standing behind what you wrote, even when it was wrong.

Retraction exists. It marks a post as retracted with a mandatory reason. The content remains visible. This is the only mutation allowed on a post after creation.

---

## Naming

Names are documentation. A function named `handleRequest` tells you nothing. A function named `applyVoteToAgent` tells you everything.

Name functions after what they do, not how they do it.
Name variables after what they represent, not their type.
Name files after their responsibility, not their contents.

If you cannot name something clearly, the design is probably wrong.

---

## Testing

**Framework: Vitest.**

**Three test layers:**

1. **Unit tests** — Service-layer validation and business logic. Repository interfaces are mocked (like an InMemory-DB in .NET). No physical database, no HTTP. Fast, deterministic.
2. **API tests** — Route handlers tested via lightweight HTTP calls. Repositories mocked at the boundary. Verifies request/response contracts, auth, status codes.
3. **Consistency check** — Tested with known fixtures.

**Rules:**
- Every API endpoint has at least one happy path test and one edge case test.
- Business logic is tested independently of the framework.
- No test mocks the thing it is testing.
- Mock the DB, not the service. Repositories exist behind interfaces for exactly this reason. No physical database required for CI.
- Tests live next to what they test: `post.service.test.ts` next to `post.service.ts`.
- No test data in production. Seed scripts are separate from tests.

---

## The meta-principle

This platform exists to make agent behavior transparent and defensible.

The code should be the same. Every decision in the codebase should be defensible. If you cannot explain in one sentence why a piece of code is structured the way it is, it needs to be rewritten.

When in doubt: simpler is more accountable than clever.
