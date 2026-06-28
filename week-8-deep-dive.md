# Week 8 — Deep Dive

**Tracks:** DSA (graphs) · JavaScript (performance & memory + `memoize`) · Machine coding (Infinite Scroll + Virtualized List) · **System design (E-commerce listing + cart — where SEO & rendering strategy take center stage).**

**Goal by Sunday:** you can explain memory leaks and write `memoize`; you can do graph BFS/DFS; and you can design an e-commerce site, leading with the SEO/SSR decision that defines it. **This completes Phase 2.**

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Number of Islands (DFS) | Memory leaks (the 4 common causes) |
| Tue | Rotting Oranges (BFS) | Garbage collection model |
| Wed | Clone Graph | Memoization → implement `memoize` |
| Thu | Course Schedule (topological / cycle) | Perf: reflow/repaint, when to debounce/throttle renders |
| Fri | Pacific Atlantic Water Flow + review | Review |
| **Sat** | **Machine coding: Infinite Scroll + Virtualized List** | |
| **Sun** | **System design: E-commerce (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Garbage collection — https://javascript.info/garbage-collection · Memory management (MDN) — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management
**JavaScript (solve):** implement `memoize` (below), then compare with GreatFrontEnd's version — https://www.greatfrontend.com/questions/javascript
**DSA (LeetCode):** Number of Islands — https://leetcode.com/problems/number-of-islands/ · Rotting Oranges — https://leetcode.com/problems/rotting-oranges/ · Clone Graph — https://leetcode.com/problems/clone-graph/ · Course Schedule — https://leetcode.com/problems/course-schedule/ · Pacific Atlantic Water Flow — https://leetcode.com/problems/pacific-atlantic-water-flow/
**System design (read):** Questions hub (E-commerce Marketplace) — https://www.greatfrontend.com/questions/system-design · FE Handbook system design — https://www.frontendinterviewhandbook.com/front-end-system-design

---

# JavaScript Track

## Memory leaks — the 4 usual suspects (asked a lot)
1. **Uncleaned timers/listeners** — `setInterval` or `addEventListener` never removed; the closure keeps captured data (incl. DOM nodes) alive. *Fix:* `clearInterval` / `removeEventListener` on teardown.
2. **Detached DOM nodes** — you removed a node from the DOM but a JS variable still references it.
3. **Closures capturing large data** — a long-lived closure holding a big object it doesn't need.
4. **Forgotten global / cache growth** — unbounded caches or accidental globals that never get freed.

This ties back to every build: the carousel cleared its interval, the modal removed its key listener. That cleanup *is* leak prevention.

## Garbage collection (the model)
JS uses **reachability**: an object is collectable when nothing reachable from the roots (globals, the call stack) references it. You don't free memory manually — you make objects *unreachable* (null out references, remove listeners) so the GC can reclaim them.

## Implement `memoize`
Cache results by arguments so repeated calls are instant.
```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);     // simple key; fine for primitives
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```
**Follow-ups:** keying by object identity (use a `WeakMap` for single-object args so entries are GC'd), and cache size limits (LRU). Memoization is itself a perf optimization that surfaces in React (`useMemo`/`memo`) and your Angular work.

---

# Machine Coding Track (Saturday)

## Build — Infinite Scroll + Virtualized List
**Two related techniques:**

**Infinite scroll** — load more when a sentinel near the bottom enters view (efficient — no scroll-event spam):
```js
function infiniteScroll(sentinel, loadMore) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });          // prefetch a bit early
  observer.observe(sentinel);
  return () => observer.disconnect();    // cleanup
}
```

**Virtualization (windowing)** — for a huge list, only render the rows currently visible. The idea: a tall spacer creates the full scroll height; on scroll, compute which slice of items is in view from `scrollTop / rowHeight` and render only those, offset into place. This keeps the DOM tiny no matter how many items exist.
```js
// sketch
function visibleRange(scrollTop, rowHeight, viewportH, total, overscan = 5) {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const count = Math.ceil(viewportH / rowHeight) + overscan * 2;
  return { start, end: Math.min(total, start + count) };
}
```
**Talking points:** infinite scroll solves *fetching*; virtualization solves *rendering*. Real apps combine both. Always `disconnect()` the observer on teardown.

---

# DSA Track — Graphs

**Idea:** nodes + edges; explore with **BFS** (queue, shortest path in unweighted graphs, level-by-level spread) or **DFS** (recursion/stack, connectivity, cycle detection). Grid problems are graphs where neighbors are up/down/left/right. **Topological sort / cycle detection** answers "can this be ordered / is there a dependency cycle."

**Number of Islands** — *DFS flood fill.* Each unvisited land cell starts an island; sink it.
```js
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';                       // mark visited
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { count++; dfs(r, c); }
  return count;
}
// O(rows*cols)
```

**Rotting Oranges** — *multi-source BFS.* Start BFS from all rotten cells at once; count minutes (levels) until none fresh remain.
**Clone Graph** — DFS/BFS with a `visited` map from original node → clone, to handle cycles.
**Course Schedule** — detect a cycle in a directed graph (topological sort via Kahn's algorithm or DFS coloring); a cycle means it's impossible.
**Pacific Atlantic Water Flow** — BFS/DFS inward from both ocean borders; answer is the intersection.

---

# System Design (Sunday): E-commerce listing + cart — RADIO

An application where **SEO and performance are the defining axes** — that's what makes it different from the feed/component designs.

**R — Requirements**
- *Functional:* product listing (grid) with filters + sort + pagination; product detail page; add to cart; manage cart.
- *Non-functional:* **SEO is critical** (product pages must rank → must be crawlable); fast load (LCP, images); mobile; accessible.
- *Clarify:* guest cart vs logged-in? how large is the catalog? which filters?

**A — Architecture**
Store (products, cart, filters) · Data access layer · Listing page (grid + filter panel + pager) · Product card · Cart.

**D — Data model / state**
- Products (by id), cart (`{ items: [{id, qty}] }`, persisted to localStorage **and** server), **filters/sort/page kept in the URL query string**.
- *Why filters in the URL:* shareable links, working back/forward buttons, and SEO-friendly crawlable filtered pages.

**I — Interface (API)**
`GET /products?category=&sort=&page=` ; `GET /products/{id}` ; `POST /cart`. Semantic, crawlable URLs for product/category pages.

**O — Optimizations & deep dive** (lead with SEO + performance)
- **SEO / rendering strategy — the headline decision:** use **SSR or SSG** so product and listing pages ship crawlable HTML (pure client-side rendering hurts SEO and LCP). Add meta tags and **structured data (JSON-LD)** for rich results. *Contrast with autocomplete, which was pure CSR* — recognizing that the rendering strategy depends on the product is a strong signal.
- **Performance:** image optimization (responsive `srcset`, lazy-load, next-gen formats) — images dominate commerce payloads; code-split routes; CDN; focus on LCP.
- **State in URL:** filters/sort/page as query params (shareable, back/forward, SEO).
- **Cart UX:** optimistic add-to-cart; persist across sessions; sync guest cart to account on login.
- **A11y:** semantic product cards, accessible filters, focus management.

**60-second summary:** "Listing and product pages are server-rendered for SEO and LCP, with structured data; filters live in the URL for shareability and crawlability; images are responsive and lazy-loaded; the cart is optimistic and persisted locally + server-side. The defining choice is SSR/SSG because this is SEO-critical."

---

## End-of-week checkpoint
- Name the 4 common memory-leak causes and write `memoize`.
- Solve Number of Islands (DFS) and Rotting Oranges (BFS) from memory.
- Build infinite scroll with IntersectionObserver and explain virtualization.
- Walk through e-commerce with RADIO and lead with the SSR/SEO decision.

---

## Phase 2 complete ✅
You've now covered: async + the core polyfills, the major DSA structures (lists, recursion/backtracking, trees, graphs), six more components, and **four system designs across both flavors** — components (autocomplete, carousel) and applications (news feed, e-commerce). You can drive a RADIO discussion on any of them.

**Next:** ping me for **Phase 3 (Weeks 9–12)** — the remaining DSA (DP, heaps/intervals), browser internals + TypeScript, the last builds, two more system designs (chat, design system), and then full **mock-interview + applying mode**. By then you'll also know your weak spots, so I'll weight Phase 3 toward them.
