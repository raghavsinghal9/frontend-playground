# Week 10 — Deep Dive

**Tracks:** DSA (heaps / priority queue + intervals) · JavaScript (browser internals: storage, fetch, CORS, rendering pipeline) · Machine coding (Progress-bar queue / Kanban) · **System design (Design System / Component Library).**

**Goal by Sunday:** you can handle interval problems and know how a heap works (and that JS has none built in); you can explain storage options, CORS, and the critical rendering path; and you can design a component library, reasoning about tokens, theming, a11y, and API design.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Merge Intervals | localStorage vs sessionStorage vs cookies |
| Tue | Insert Interval / Non-overlapping Intervals | `fetch`, XHR, and the request lifecycle |
| Wed | Kth Largest Element (heap) | CORS — what it is and why preflight |
| Thu | Top K Frequent Elements | Critical rendering path; reflow vs repaint |
| Fri | Review intervals + heap | Review |
| **Sat** | **Machine coding: Progress-bar queue (or Kanban)** | |
| **Sun** | **System design: Design System / Component Library (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Web Storage API — https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API · Fetch — https://javascript.info/fetch · CORS — https://javascript.info/fetch-crossorigin · Critical rendering path — https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path
**DSA (LeetCode):** Merge Intervals — https://leetcode.com/problems/merge-intervals/ · Insert Interval — https://leetcode.com/problems/insert-interval/ · Non-overlapping Intervals — https://leetcode.com/problems/non-overlapping-intervals/ · Kth Largest Element — https://leetcode.com/problems/kth-largest-element-in-an-array/ · Top K Frequent Elements — https://leetcode.com/problems/top-k-frequent-elements/
**System design (read):** Types of questions (UI components) — https://www.greatfrontend.com/front-end-system-design-playbook/types-of-questions · Questions hub — https://www.greatfrontend.com/questions/system-design

---

# JavaScript Track — Browser Internals

## Storage options (know the trade-offs)
- **localStorage** — ~5–10MB, persists until cleared, synchronous, string-only, same-origin. Good for non-sensitive UI state.
- **sessionStorage** — same API, but cleared when the tab closes; scoped per tab.
- **Cookies** — tiny (~4KB), sent with **every** HTTP request (overhead), can be `HttpOnly` (JS can't read — good for auth tokens) and `Secure`/`SameSite`. Use for server-read data like sessions.
- **IndexedDB** — large, async, structured; for offline data (the chat/email queues from Weeks 9/11).

## fetch, XHR & the request lifecycle
`fetch` returns a Promise resolving to a `Response` (note: it only rejects on network failure, **not** on HTTP 4xx/5xx — check `res.ok`). `AbortController` cancels requests (ties to autocomplete race conditions).
```js
const controller = new AbortController();
const res = await fetch('/api', { signal: controller.signal });
if (!res.ok) throw new Error(res.status);   // fetch doesn't throw on 404/500
const data = await res.json();
```

## CORS (frequently asked)
The browser blocks cross-origin requests unless the server opts in via `Access-Control-Allow-Origin` headers. "Non-simple" requests (custom headers, methods like PUT/DELETE) trigger a **preflight** `OPTIONS` request first. CORS is enforced by the **browser**, not the server — the server just declares what's allowed.

## Critical rendering path & reflow/repaint
The browser turns HTML→DOM, CSS→CSSOM, combines into the render tree, then **layout** (positions/sizes) → **paint** → **composite**. **Reflow** (layout) is expensive — triggered by geometry changes (size, position, adding/removing nodes). **Repaint** is cheaper (color/visibility). To stay fast: batch DOM reads/writes, animate with `transform`/`opacity` (composited, skip layout), avoid layout thrashing (read-then-write in a loop).

---

# DSA Track — Heaps & Intervals

## Heaps / Priority Queue
A heap gives O(log n) insert and O(1) peek of the min/max — ideal for "top K" and "kth largest." **JS has no built-in heap** (a key thing to say); use a min-heap of size k, or sort, or quickselect.
```js
class MinHeap {
  constructor() { this.h = []; }
  size() { return this.h.length; }
  peek() { return this.h[0]; }
  push(v) {
    this.h.push(v);
    let i = this.h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p] <= this.h[i]) break;
      [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
      i = p;
    }
  }
  pop() {
    const top = this.h[0], last = this.h.pop();
    if (this.h.length) {
      this.h[0] = last;
      let i = 0, n = this.h.length;
      while (true) {
        let s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && this.h[l] < this.h[s]) s = l;
        if (r < n && this.h[r] < this.h[s]) s = r;
        if (s === i) break;
        [this.h[s], this.h[i]] = [this.h[i], this.h[s]];
        i = s;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {     // keep k largest in a min-heap; root is the answer
  const heap = new MinHeap();
  for (const n of nums) { heap.push(n); if (heap.size() > k) heap.pop(); }
  return heap.peek();
}
// O(n log k)
```

## Intervals
**Merge Intervals** — *sort by start, then merge overlaps.*
```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]); // overlap
    else res.push(intervals[i]);
  }
  return res;
}
// O(n log n)
```
**Insert Interval** — add then merge (or merge in one pass). **Non-overlapping Intervals** — greedy: sort by end, keep the earliest-ending, count removals. **Top K Frequent** — count with a map, then heap or bucket sort.

---

# Machine Coding Track (Saturday)

## Build — Progress-bar Queue (concurrency-limited)
**Requirements:** clicking "Add" appends a bar; bars fill over time; at most N fill concurrently; the rest wait their turn.
```js
function createProgressQueue(container, maxConcurrent = 3) {
  let active = 0;
  const waiting = [];

  function addBar() {
    const bar = document.createElement('div'); bar.className = 'bar';
    const fill = document.createElement('div'); fill.className = 'fill';
    bar.append(fill); container.append(bar);
    waiting.push(fill);
    runNext();
  }
  function runNext() {
    while (active < maxConcurrent && waiting.length) {
      const fill = waiting.shift();
      active++;
      let w = 0;
      const timer = setInterval(() => {
        fill.style.width = (w += 1) + '%';
        if (w >= 100) { clearInterval(timer); active--; runNext(); } // free a slot, pull next
      }, 20);
    }
  }
  return addBar;
}
```
**Talking points:** the concurrency limit + waiting queue is the crux; `clearInterval` on completion (leak prevention); `requestAnimationFrame` for smoother fills. *(Kanban alternative: drag-and-drop with the HTML Drag and Drop API, reordering a state array on drop.)*

---

# System Design (Sunday): Design System / Component Library — RADIO

This is an **architecture/library** design — it tests API design, accessibility, and DX (developer experience) thinking, which reads as senior.

**R — Requirements**
- *Functional:* a set of reusable, consistent UI components (button, input, modal, select…) usable across many apps/teams.
- *Non-functional:* visual consistency; **accessibility built in**; theming (light/dark, brands); good DX; tree-shakeable; versioned.
- *Clarify:* one product or many? framework-specific or agnostic? runtime theming needed?

**A — Architecture (layers)**
**Design tokens** (colors, spacing, typography, radii — the single source of truth) → **primitive components** (Button, Input) → **composite components** (Select, DatePicker) → **theming layer** → **docs** (Storybook) → **distribution** (npm package).

**D — Data / structure**
Token structure (semantic names like `color.primary`, not raw hex); a theme object mapping tokens to values; consistent prop conventions across components.

**I — Interface (component API — the heart of this one)**
- Consistent prop naming (`variant`, `size`, `disabled`); **controlled vs uncontrolled** patterns; **composition** via children/slots over deep config; a polymorphic `as` prop where useful; well-typed public exports (TypeScript).

**O — Optimizations & deep dive**
- **Theming:** tokens surfaced as **CSS variables** for runtime theming (light/dark, multi-brand) without rebuilds.
- **Accessibility (the whole point):** keyboard nav, focus management, and ARIA baked into every component so consumers get it for free.
- **Performance/DX:** **tree-shaking** via per-component entry points; minimal runtime; TypeScript types; Storybook docs; **semantic versioning** + changelogs so breaking changes are predictable.
- **Consistency:** lint rules / token enforcement so teams can't drift.

**60-second summary:** "Tokens are the foundation, surfaced as CSS variables for runtime theming; primitives and composites build on them with consistent, well-typed APIs and accessibility baked in; it's tree-shakeable, documented in Storybook, and semantically versioned."

---

## End-of-week checkpoint
- Solve Merge Intervals and Kth Largest from memory; explain why JS has no native heap and how you'd work around it.
- Explain localStorage vs cookies, what CORS/preflight is, and reflow vs repaint.
- Build the concurrency-limited progress-bar queue.
- Walk through a design system with RADIO, leading with tokens → API design → accessibility.
