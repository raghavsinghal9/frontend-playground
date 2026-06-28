# Frontend SDE-1 / SDE-2 — 12-Week Interview Prep Tracker

**Target:** Frontend SDE-1/SDE-2 roles, Bengaluru (Angular-first, also React). GCCs + product companies.
**Your windows:** weekday mornings (~2 hrs) + weekends (~5–6 hrs/day) ≈ ~20 hrs/week.
**Start:** tomorrow. **Suggested length:** 12 weeks. Start applying around **Week 4** — don't wait till the end; referrals take time and early interviews are practice.

---

## The 4 tracks and where they live in your week

| Slot | Track |
|---|---|
| Weekday mornings (~75 min) | **DSA** — 1–2 problems by pattern |
| Weekday mornings (~45 min) | **JavaScript fundamentals** + implement one utility |
| Saturday (~5 hrs) | **Machine coding** — build a working component, timed |
| Sunday (~5 hrs) | **Frontend system design** (from Wk 5) + review + STAR + applying |

> Machine coding = *build it in code, it must run*. System design = *architect it on a whiteboard, no running code, you drive the discussion.*

---

## Quick frameworks to internalize

**Machine coding approach:** clarify requirements → sketch component breakdown → build the skeleton (structure + state) → make it work → handle edge cases (empty, loading, error, keyboard, a11y) → refactor for readability. Narrate as you go.

**RADIO framework (for system design):**
- **R**equirements — functional + non-functional (scale, perf, devices, a11y). Clarify out loud.
- **A**rchitecture — components, their boundaries, and how they talk.
- **D**ata model — what state/data each component holds; client vs server state.
- **I**nterface (API) — API contracts, request/response shape, events between components.
- **O**ptimizations — performance (lazy load, virtualization, caching, code splitting), a11y, error/loading states, edge cases.

---

# PHASE 1 — Rebuild Foundations (Weeks 1–4)
*Goal: DSA patterns back to easy-medium fluency, core JS solid, machine-coding muscle started.*

### Week 1
- **DSA:** Arrays & Strings basics · Two Pointers · Hashing (HashMap / HashSet). *(~6–8 problems: two-sum, valid anagram, contains duplicate, reverse string, two-pointer pair problems.)*
- **JavaScript:** Execution context, scope, hoisting, **closures**. → Implement **`debounce`** and **`throttle`**.
- **Machine coding (Sat):** **Star Rating** + **Todo List** (state, events, render, add/delete/toggle).
- **System design (Sun):** *(not yet)* — second machine-coding build OR JS catch-up + skim what FE system design is. Note target companies; start a referral list.

### Week 2
- **DSA:** Sliding Window · Prefix Sum. *(max subarray, longest substring without repeating chars, min size subarray sum.)*
- **JavaScript:** **`this`** binding, `call`/`apply`/`bind`, arrow vs regular functions. → Implement **`myBind`, `myCall`, `myApply`**.
- **Machine coding (Sat):** **Accordion** + **Tabs** (toggling, single vs multi-open).
- **System design (Sun):** review week + practice writing JS in a plain editor (no autocomplete). Begin drafting 2 STAR stories (the migration, the leave engine).

### Week 3
- **DSA:** Stack & Queue · intro Monotonic Stack. *(valid parentheses, min stack, next greater element, implement queue using stacks.)*
- **JavaScript:** Prototypes & prototypal inheritance, `new`, ES6 classes. → Implement the **`new`** operator + **`Object.create`**.
- **Machine coding (Sat):** **Autocomplete / Typeahead** (debounced input, async fetch, keyboard navigation, highlight match).
- **System design (Sun):** review + **start applying** (Angular roles + GCCs, referrals-first). Finalize 3 STAR stories.

### Week 4
- **DSA:** Binary Search (on array + on answer) · Sorting basics. *(binary search, search in rotated array, first/last position, sqrt(x).)*
- **JavaScript:** Async foundations — **event loop, microtasks vs macrotasks**, callbacks, `setTimeout`/`setInterval`. → Predict-the-output drills on event-loop ordering.
- **Machine coding (Sat):** **Carousel / Image Slider** (auto-play timers, prev/next, looping, pause-on-hover).
- **System design (Sun):** learn the **RADIO framework** + how system design differs from machine coding. Ramp applications. Keep referrals going.

---

# PHASE 2 — Build Interview Skills (Weeks 5–8)
*Goal: medium DSA fluency, deep JS, fast machine coding, and frontend system design started in earnest (your highest-ROI area).*

### Week 5
- **DSA:** Linked Lists (reverse, fast/slow pointers, merge, cycle detection).
- **JavaScript:** **Promises & async/await** deeply. → Implement **`Promise.all`, `Promise.race`, `Promise.allSettled`**.
- **Machine coding (Sat):** **Modal / Dialog** + **Toast notification queue** (focus trap, ESC to close, auto-dismiss, accessibility).
- **System design (Sun):** **Design an Autocomplete / Typeahead system** (the canonical first one): components, API, debouncing, caching results, ranking, performance, a11y, failure modes. Use RADIO.

### Week 6
- **DSA:** Recursion & Backtracking basics (subsets, permutations, combinations).
- **JavaScript:** Array methods + **implement polyfills** for `map`, `filter`, `reduce`, `forEach`, `flat`. Currying & partial application.
- **Machine coding (Sat):** **Nested Comments / Tree view** (recursive rendering, add reply, collapse/expand).
- **System design (Sun):** **Design an Image Carousel / Photo gallery** (lazy loading, preloading next/prev, responsive images, perf budget).

### Week 7
- **DSA:** Trees — traversals (BFS/DFS, level-order), BST insert/search/validate.
- **JavaScript:** **DOM** — event delegation, bubbling vs capturing, DOM traversal & manipulation in **vanilla JS**. → Implement an **Event Emitter** (pub/sub).
- **Machine coding (Sat):** **Data Table** with sorting, filtering, and pagination.
- **System design (Sun):** **Design a News Feed / Infinite-scroll feed** (pagination vs infinite scroll, caching, list virtualization, optimistic updates, skeleton loading).

### Week 8
- **DSA:** Graphs — BFS/DFS, number of islands, connected components.
- **JavaScript:** **Performance & memory** — closures causing memory leaks (listeners/timers holding references after unmount), garbage collection, memoization. → Implement **`memoize`**.
- **Machine coding (Sat):** **Infinite Scroll + Virtualized List** (IntersectionObserver, windowing for perf).
- **System design (Sun):** **Design an E-commerce product listing + cart** (state management, data layer, URL/query state, filters, optimistic cart updates).

---

# PHASE 3 — Interview Mode (Weeks 9–12)
*Goal: mocks, polish, company-specific tailoring, full applying push, iterate on real feedback.*

### Week 9
- **DSA:** Dynamic Programming basics — 1D (climbing stairs, house robber, coin change, longest increasing subsequence).
- **JavaScript:** Modules (ESM vs CJS), generators/iterators basics, `Symbol`. → Implement **deep clone** + **deep equal**.
- **Machine coding (Sat):** **Form with validation** (dynamic fields, inline errors, submit states) OR **OTP input**.
- **System design (Sun):** **Design a Chat application** (real-time via WebSockets, message sync, pagination, online status, offline queue).

### Week 10
- **DSA:** Heaps / Priority Queue + Intervals (merge intervals, kth largest, meeting rooms). Greedy intro.
- **JavaScript:** Browser internals — storage (localStorage/session/cookies), `fetch`/XHR, **CORS** basics, rendering pipeline (reflow/repaint, critical rendering path).
- **Machine coding (Sat):** **Progress-bar queue** (sequential bars via `setTimeout`/`setInterval`) OR **Kanban board** (drag-and-drop).
- **System design (Sun):** **Design a reusable Component Library / Design System** (architecture, theming/tokens, accessibility, public API design, versioning).

### Week 11
- **DSA:** Mixed medium review — revisit your 2 weakest patterns; timed sets (2 problems in 45 min, narrate + self-correct).
- **JavaScript:** **TypeScript essentials** (types, interfaces, generics, utility types) — TS-less candidates get screened out. + framework internals revision (Angular change detection & Signals; React virtual DOM/reconciliation & hooks).
- **Machine coding (Sat):** re-build **2 favorites under strict time** (mock conditions, plain editor).
- **System design (Sun):** **Design Google-Docs-lite / collaborative editor** OR **email client** (complex client state, sync, offline) + cross-cutting topics: CSR vs SSR vs SSG, security (XSS/CSRF), i18n.

### Week 12
- **DSA:** Company-tagged problems for your target companies; maintain daily warm-up (1–2 problems).
- **JavaScript:** Rapid revision — quick-fire quiz across all topics; redo any shaky polyfills.
- **Machine coding (Sat):** full **mock machine-coding round** (timed, out loud).
- **System design (Sun):** full **mock system-design round** (redo 2 designs talking through RADIO end-to-end). Polish all 5–6 STAR stories. Full application push.

---

## Behavioral / STAR (prepare 5–6 stories — drill from Week 2, polish by Week 12)
1. **Ownership at scale** — owning the frontend for HR domains used across a large enterprise client's entire workforce.
2. **Technical leadership** — leading the Angular 18→20 migration.
3. **Complex system** — the configurable leave policy engine with automated routing.
4. **Conflict / disagreement** — a time you pushed back on an approach.
5. **Mentoring / collaboration** — bringing teammates up on Angular patterns.
6. **Failure / learning** — a bug or miss and what you changed.

Format each as **Situation → Task → Action → Result**, ~2 minutes, result-focused.

---

## Resources

**DSA:** NeetCode 150 (pattern-based) · Striver A2Z / SDE sheet on takeuforward (you have **TUF+** — use it) · LeetCode by pattern.

**JavaScript + machine coding:** **GreatFrontEnd** (best single resource for FE interviews) · **BFE.dev** (bigfrontend.dev) · **Frontend Interview Handbook** (free) · JavaScript.info · Lydia Hallie's JS questions · Frontend Mentor (UI builds).

**Frontend system design:** GreatFrontEnd system-design section (teaches RADIO) · Frontend Interview Handbook system-design section · *System Design Interview* by Alex Xu (for backend concepts that surface) · LearnersBucket FE system design.

*GreatFrontEnd is paid but the gold standard; the free stack (Frontend Interview Handbook + BFE.dev + JavaScript.info + NeetCode) covers most of it.*

---

## Practice habits that matter
- Practice coding in a **plain editor with no autocomplete** — interview environments (CoderPad) have none, and the gap shows under pressure.
- **Narrate** your reasoning while coding; interviewers reward catching and fixing your own bugs.
- For system design, **drive the conversation** from a vague prompt — reduce ambiguity yourself; don't wait to be guided.
- Apply and interview **in parallel** with prep from ~Week 4 — early interviews are your best mocks.
- Keep your Naukri/LinkedIn **active** (small edits) while applying.
