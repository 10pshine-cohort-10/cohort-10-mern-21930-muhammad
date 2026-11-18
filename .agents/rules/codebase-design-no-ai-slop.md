---
trigger: always_on
glob:
description: Enforce human-quality code output — no AI slop, no filler, no boilerplate walls.
---

# Anti-AI-Slop Rules for This Codebase

These rules are non-negotiable. Every piece of generated code, documentation, commit message, and comment must read like it was written by a competent engineer who cares about the codebase, not by a language model padding its output.

## 1. No Filler Comments

- NEVER write comments that restate the code. `// Set the name` above `setName(name)` is worthless.
- Comments exist to explain WHY, not WHAT. If the code is clear, skip the comment entirely.
- NEVER write section-separator comments like `// ========= HELPER FUNCTIONS =========`. Use file structure instead.
- NEVER write `// TODO: implement this` as a placeholder. Either implement it or don't create the file.

## 2. No Boilerplate Walls

- Do NOT generate massive blocks of repetitive code. If three routes share the same pattern, extract a factory or loop.
- Do NOT generate placeholder content or dummy data beyond what is strictly needed for a test fixture.
- Do NOT create empty files, empty classes, or skeleton functions that say `// implementation goes here`.

## 3. No Marketing Language in Code or Docs

- NEVER use phrases like "robust solution", "enterprise-grade", "cutting-edge", "seamless experience", "leveraging the power of", "unleash", "dive into", "embark on", "harness", "elevate", "empower", "streamline".
- README and docs must be factual and direct. Describe what the project does, how to run it, and how to test it. That's it.
- Do NOT write motivational introductions or conclusion paragraphs. No "Happy coding!" or "Feel free to contribute!"

## 4. Variable and Function Naming

- Names must be specific and descriptive. `data`, `result`, `info`, `item`, `temp`, `stuff` are banned as standalone names.
- Boolean variables start with `is`, `has`, `can`, `should`, or similar predicates.
- Handler functions describe the action: `handleNoteDelete`, not `handleClick` or `onPress`.
- NO abbreviations unless universally understood (`req`, `res`, `err`, `db`, `auth`, `config` are fine).

## 5. Error Handling

- NEVER use empty catch blocks. Every catch must log the error or rethrow with context.
- NEVER swallow errors with `catch (e) { return null }` without logging.
- Error messages must be specific: "Failed to fetch notes for user 42" not "Something went wrong".
- Use HTTP status codes correctly. 400 for bad input, 401 for missing auth, 403 for forbidden, 404 for not found, 409 for conflicts, 500 for server errors.

## 6. File and Folder Structure

- One concern per file. A route file defines routes. A controller file handles request/response. A service file holds business logic.
- Do NOT dump everything into `utils.js` or `helpers.js`. Name files after what they contain.
- Test files mirror source files: `src/services/noteService.js` → `test/services/noteService.test.js`.
- Keep the repo root clean: only config files and READMEs at root level.

## 7. Commit Messages

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- The subject line describes the change, not the file: `feat: add JWT refresh token rotation` not `update auth.js`.
- No emoji in commit messages.

## 8. Frontend Specifics

- Components must be small and focused. If a component file exceeds 150 lines, split it.
- Do NOT inline styles as objects unless it is a one-off dynamic value. Use CSS modules or a stylesheet.
- Do NOT use `index.js` barrel exports for every folder. Only use them when the folder is a single public unit.
- State that is used by one component stays in that component. Lift state only when a sibling needs it.
- Forms must have proper validation feedback, not just console.log on error.

## 9. Backend Specifics

- Every route must have input validation before touching the database.
- SQL queries must use parameterized statements. No string concatenation for queries, ever.
- Passwords are hashed with bcrypt, minimum 10 salt rounds.
- JWT secrets come from environment variables, never hardcoded.
- API responses follow a consistent shape: `{ success: boolean, data?: any, error?: string }`.

## 10. Testing

- Tests must assert behavior, not implementation. Test what the function returns or what side effect occurs, not how it internally works.
- Do NOT write tests that just check `expect(true).to.be.true`. Every test must exercise real logic.
- Test descriptions must read as sentences: `it('returns 401 when no token is provided')`.
- Mock external dependencies (database, HTTP calls), never the function under test.

## 11. Documentation

- README files explain: what it is, how to set it up, how to run it, how to test it, and what the API endpoints are.
- No badges unless they link to something real (CI status, coverage report).
- No "Table of Contents" for documents under 200 lines.
- API documentation lists method, path, request body, response body, and status codes. Nothing more.
