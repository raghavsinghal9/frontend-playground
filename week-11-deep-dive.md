# Week 11 — Deep Dive

**Tracks:** DSA (mixed-medium review) · JavaScript (TypeScript essentials + framework internals) · Machine coding (rebuild 2 favorites under time) · **System design (Email client / Collaborative editor + cross-cutting concepts).**

**Goal by Sunday:** you're comfortable reading and writing typed code (TS is a screening gate in 2026); you can explain Angular and React internals at a high level; and you can design a complex stateful app and speak to the cross-cutting topics interviewers probe.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Revisit weakest pattern #1 (timed) | TS: types, interfaces, unions |
| Tue | Revisit weakest pattern #2 (timed) | TS: generics |
| Wed | 2 mixed mediums (45-min timer, narrate) | TS: utility types (Partial/Pick/Omit/Record) |
| Thu | 2 mixed mediums (45-min timer) | Angular internals: change detection + Signals |
| Fri | Review misses | React internals: VDOM, reconciliation, hooks |
| **Sat** | **Machine coding: rebuild 2 favorites under strict time** | |
| **Sun** | **System design: Email client (RADIO) + cross-cutting concepts + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**TypeScript (read):** Everyday types — https://www.typescriptlang.org/docs/handbook/2/everyday-types.html · Generics — https://www.typescriptlang.org/docs/handbook/2/generics.html · Utility types — https://www.typescriptlang.org/docs/handbook/utility-types.html
**Framework internals (read):** Angular Signals — https://angular.dev/guide/signals · React hooks reference — https://react.dev/reference/react/hooks
**DSA (review):** NeetCode roadmap — https://neetcode.io/roadmap · LeetCode (filter by your target companies' tags)
**System design (read):** FE Handbook system design — https://www.frontendinterviewhandbook.com/front-end-system-design · OT/CRDT resources (for collaborative editors) — https://github.com/greatfrontend/awesome-front-end-system-design

---

# JavaScript Track

## TypeScript essentials (the screening gate)
```ts
// types, interfaces, unions, optionals
interface User { id: number; name: string; email?: string; }
type Status = 'active' | 'archived';                 // union

// generics — reusable, type-safe
function first<T>(arr: T[]): T | undefined { return arr[0]; }
function identity<T>(value: T): T { return value; }

// utility types — derive types instead of repeating
type PartialUser = Partial<User>;     // all fields optional
type NameOnly    = Pick<User, 'name'>;
type NoId        = Omit<User, 'id'>;
type UserMap     = Record<number, User>;
type ReadUser    = Readonly<User>;
```
**What interviewers check:** can you type props/state, write a generic function, and reach for `Partial`/`Pick`/`Omit`/`Record` instead of duplicating shapes. Know `unknown` vs `any` (prefer `unknown`), and that interfaces extend / types compose.

## Framework internals (be able to explain yours)
**Angular** (your primary):
- **Change detection** — historically zone.js patches async APIs and triggers a CD pass that checks bindings top-down; `OnPush` limits checks to input changes / events. **Signals** (the modern direction) make reactivity **fine-grained** — only the components reading a changed signal update, reducing the need for zone-based whole-tree checks. You led an Angular 18→20 migration, so connect your migration story to this.

**React** (be conversant):
- **Virtual DOM + reconciliation** — render produces a virtual tree; React diffs it against the previous tree and patches only what changed; **keys** let it match list items efficiently. **Hooks** rules: call at the top level, in the same order each render (that's how `useState` tracks which state is which). `useMemo`/`useCallback`/`memo` are memoization (ties to Week 8).

---

# Machine Coding Track (Saturday): mock rebuilds

No new build — **simulate the real round.** Pick two of your strongest earlier components (e.g., Autocomplete from Week 3/5 and Data Table from Week 7) and rebuild each from a blank file, **timed (45 min), narrating out loud, no copy-paste.**

Score yourself on what interviewers actually grade:
- Did you clarify requirements first?
- Clean component breakdown and a single state source?
- Edge cases handled (empty/loading/error, keyboard, a11y)?
- Did you talk through your reasoning and catch your own bugs?
- Finished something working in time?

This week is about **fluency under pressure**, not learning new components.

---

# DSA Track — Mixed-Medium Review

No new patterns — consolidate. Revisit your two weakest areas from Phases 1–2 (commonly DP, graphs, or backtracking), then do **timed mixed sets**: 2 mediums in 45 minutes, narrating as if interviewing. Use the NeetCode roadmap to spot gaps. The goal is **recognition speed** — glancing at a problem and knowing the pattern in seconds.

---

# System Design (Sunday): Email client — RADIO (+ collaborative editor note)

A complex stateful app with offline needs. Read the FE Handbook system-design section alongside.

**R — Requirements**
- *Functional:* folder list (inbox/sent/…); paginated email list; email/thread detail; compose & send; search; mark read/star/delete.
- *Non-functional:* handle large mailboxes; offline access; fast; accessible.
- *Clarify:* threading? real-time new-mail push? attachments?

**A — Architecture**
Store (folders, emails normalized, threads) · data access layer with an **offline cache (IndexedDB)** · 3-pane UI (folders | list | detail) · composer.

**D — Data model**
Emails by id `{ id, from, subject, snippet, body, read, starred, threadId, timestamp }`; folders; pagination cursors; draft + sync state; an **action queue** for offline operations.

**I — Interface**
`GET /folders`, `GET /folders/{id}/emails?cursor=`, `GET /emails/{id}`; `POST /emails` (send); `PATCH /emails/{id}` (read/star). Cursor pagination for large mailboxes.

**O — Optimizations & deep dive**
- **Performance:** **virtualize** the email list; lazy-load bodies; prefetch on hover/selection.
- **Offline (the standout):** cache in IndexedDB; **optimistic** read/star/delete queued and synced on reconnect (same pattern as the chat queue in Week 9).
- **Search:** debounced; server-side for large mailboxes.
- **Layout:** responsive 3-pane → stacked on mobile; threading logic.
- **A11y:** keyboard shortcuts (Gmail-style), semantic lists, focus management.

**Collaborative editor note (if asked instead):** the defining hard problem is **concurrent editing / conflict resolution** — solved with **Operational Transformation (OT)** or **CRDTs**, real-time sync over WebSockets, and **cursor presence**. You don't need to implement OT, but naming it + "eventual consistency" + WebSocket sync is the expected depth.

## Cross-cutting concepts (interviewers probe these — keep crisp answers ready)
- **Rendering strategies:** **CSR** (SPA, poor SEO, fast nav) vs **SSR** (HTML on each request, good SEO/LCP) vs **SSG** (prebuilt, fastest, for static content) vs ISR (revalidate SSG). Pick based on SEO + freshness needs (recall: autocomplete = CSR, e-commerce = SSR/SSG).
- **Security:** **XSS** (inject scripts → sanitize output, avoid `innerHTML`, use CSP) and **CSRF** (forged requests → SameSite cookies, CSRF tokens). HttpOnly cookies for tokens.
- **i18n:** externalize strings, support locale formatting (dates/numbers/currency), handle RTL layouts and pluralization.
- **Performance budget:** code splitting, lazy loading, image optimization, caching, measuring Core Web Vitals (LCP/CLS/INP).

---

## End-of-week checkpoint
- Write a generic function and use `Partial`/`Pick`/`Omit`/`Record`; explain `unknown` vs `any`.
- Explain Angular change detection + Signals and React VDOM/reconciliation/hooks at a high level.
- Rebuild two components under a 45-min timer, narrating, no copy-paste.
- Walk through the email client with RADIO and give crisp answers on CSR/SSR/SSG, XSS/CSRF, and i18n.
