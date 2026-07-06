# AI_AGENT_WORKFLOW.md
> How to drive Antigravity so it makes you better instead of making you dependent.

## The core rule
The agent is a fast junior dev who has read everything but understands nothing about *your* project's intent. You are the tech lead. It writes; you review, question, and decide.

## Session setup (every time)
1. Attach/paste `PROJECT_CONTEXT.md` (and `DATABASE_SCHEMA.md` once it exists) at the start of a new session or when switching models.
2. Give it ONE task from `TASKS.md` at a time — never "build the auth module" as a single blob. Break it further:
   - "Build the register endpoint: validate input with Zod-equivalent on backend, hash password, create user, return JWT. Follow the response format in PROJECT_CONTEXT.md."
   - Then separately: "Now build login." Then "Now the auth middleware."

## Good prompt structure
```
Context: [1 line — what part of the app this is]
Task: [exact, scoped thing to build]
Constraints: [reference PROJECT_CONTEXT.md conventions, e.g. response shape, folder location]
Acceptance check: [how you'll know it's done — e.g. "should return 409 if email exists"]
```
Bad prompt: "add cart feature"
Good prompt: "Add POST /api/cart/add. Input: productId, quantity. If item exists in user's cart, increment quantity instead of duplicating row. Return updated cart with computed total. Use the standard response format."

## Review discipline (non-negotiable, this is how you avoid becoming a copy-paste operator)
After every AI-generated chunk:
1. **Read every line before running it.** If you don't understand a line, that's the line to ask about — not skip.
2. Ask the agent: *"Explain why you did X this way instead of Y"* — especially for anything involving auth, validation, or DB queries. You already do this well (you caught the `clo_plo_mapping` bug and the N+1 query issue on FYP-LMS this way — keep doing exactly that here).
3. Test it yourself in Postman immediately. Don't let the agent tell you it works — verify.
4. If something feels like magic, stop and ask it to break the logic into steps in plain English before you move on.

## Learning-while-coding protocol
- After finishing each Phase in TASKS.md, spend 15–20 min **without the agent**: re-implement one small piece from scratch (e.g. write the JWT middleware yourself after the agent built the first version) to check you actually absorbed it.
- Keep a running `LEARNINGS.md` (optional) — one line per concept you had the agent explain, so you're not re-asking the same thing every project.
- When stuck, ask the agent to explain the *concept* first, then ask it to implement — don't jump straight to implementation on unfamiliar territory (JWT refresh flow, coupon math, pagination cursors are good candidates for this).

## Multi-model note (Gemini/Claude in Antigravity)
- Use one model to generate a first pass, and — for anything security- or logic-critical (auth, coupon math, order totals) — ask a second model to review the first model's output before you accept it. Disagreements between the two are usually worth digging into.
- Since payment is mocked, don't let the agent quietly wire in a real gateway SDK "for realism" — keep it to a status field + label, per DATABASE_SCHEMA.md.
- Keep `PROJECT_CONTEXT.md` attached regardless of which model you switch to — models don't share memory of your earlier decisions.

## Weekly self-check
- Can you explain, without the agent, how a request flows from frontend → API → DB → response for the feature you just built? If not, that's this week's real task, not "move faster."
