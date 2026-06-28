# Week 7 — Deep Dive

**Tracks:** DSA (trees) · JavaScript (DOM events, delegation + Event Emitter) · Machine coding (Data Table: sort/filter/paginate) · **System design (News Feed — a full application design).**

**Goal by Sunday:** you can explain bubbling/capturing and event delegation and build an Event Emitter; you can do BFS/DFS on trees; and you can design a news feed, reasoning about pagination, optimistic updates, and virtualization.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Maximum Depth of Binary Tree | Event bubbling vs capturing |
| Tue | Binary Tree Level Order Traversal (BFS) | Event delegation (and why it scales) |
| Wed | Validate Binary Search Tree | Implement an Event Emitter |
| Thu | Invert Binary Tree | DOM traversal/manipulation in vanilla JS |
| Fri | Lowest Common Ancestor of a BST + review | Review |
| **Sat** | **Machine coding: Data Table (sort + filter + pagination)** | |
| **Sun** | **System design: News Feed (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Bubbling & capturing — https://javascript.info/bubbling-and-capturing · Event delegation — https://javascript.info/event-delegation
**JavaScript (solve):** Event Emitter — https://www.greatfrontend.com/questions/javascript/event-emitter
**DSA (LeetCode):** Maximum Depth — https://leetcode.com/problems/maximum-depth-of-binary-tree/ · Level Order Traversal — https://leetcode.com/problems/binary-tree-level-order-traversal/ · Validate BST — https://leetcode.com/problems/validate-binary-search-tree/ · Invert Binary Tree — https://leetcode.com/problems/invert-binary-tree/ · Lowest Common Ancestor of a BST — https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/
**System design (read — free):** News Feed is a free case study — Questions hub — https://www.greatfrontend.com/questions/system-design · FE Handbook system design — https://www.frontendinterviewhandbook.com/front-end-system-design

---

# JavaScript Track

## Event bubbling, capturing & delegation
When an event fires, it travels **capturing** phase (document → target) then **bubbling** phase (target → document). Most handlers run on bubble. `addEventListener(type, fn, true)` listens in the capture phase. `event.stopPropagation()` halts travel; `event.target` is what was clicked, `event.currentTarget` is where the handler is attached.

**Event delegation** = attach ONE listener on a parent and use `event.target.closest(...)` to handle events from many children. Why it matters: fewer listeners (memory/perf), and it works for elements added later. You've used this in every machine-coding build so far.
```js
list.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return;
  handle(item.dataset.id);
});
```

## Implement an Event Emitter (pub/sub)
```js
class EventEmitter {
  constructor() { this.events = new Map(); }       // name -> Set of callbacks
  on(name, cb) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(cb);
    return () => this.off(name, cb);               // return an unsubscribe fn
  }
  off(name, cb) { this.events.get(name)?.delete(cb); }
  emit(name, ...args) { this.events.get(name)?.forEach((cb) => cb(...args)); }
  once(name, cb) {
    const wrapper = (...args) => { cb(...args); this.off(name, wrapper); };
    this.on(name, wrapper);
  }
}
```
**Follow-ups:** `once`, returning an unsubscribe handle (done), and handling a listener that unsubscribes during `emit`.

---

# Machine Coding Track (Saturday)

## Build — Data Table (sort, filter, paginate)
**Requirements:** render rows; click a column header to sort; filter by a search box; paginate. Keep a single state object and a `render()`.
```js
const state = { data: [], sortKey: null, sortDir: 1, query: '', page: 0, pageSize: 10 };

function getView() {
  let rows = state.data;
  if (state.query) {
    const q = state.query.toLowerCase();
    rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  if (state.sortKey) {
    rows = [...rows].sort((a, b) => {
      const x = a[state.sortKey], y = b[state.sortKey];
      return (x > y ? 1 : x < y ? -1 : 0) * state.sortDir;
    });
  }
  const start = state.page * state.pageSize;
  return { rows: rows.slice(start, start + state.pageSize), total: rows.length };
}

function sortBy(key) {
  state.sortDir = state.sortKey === key ? -state.sortDir : 1;  // toggle direction
  state.sortKey = key;
  state.page = 0;
  render();
}
// render() draws headers (wired to sortBy), filtered+sorted+paged rows, and pager controls.
```
**Talking points:** filter → sort → paginate order; reset to page 0 on filter/sort change; for huge datasets, do it server-side (send sort/filter/page params) and/or virtualize rows.

---

# DSA Track — Trees

**Idea:** recursion is natural for trees (process node, recurse children). **DFS** via recursion/stack (depth-first: preorder/inorder/postorder); **BFS** via a queue (level by level). For **BST**, inorder traversal is sorted, and the left/right subtree value bounds power validation.

**Binary Tree Level Order Traversal** — *BFS with a queue.*
```js
function levelOrder(root) {
  if (!root) return [];
  const res = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {            // process exactly one level
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
// O(n) time, O(n) space
```

**Validate BST** — *DFS with value bounds.*
```js
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
// O(n) time
```

**Maximum Depth** — `1 + max(depth(left), depth(right))`.
**Invert Binary Tree** — swap left/right at every node (recurse).
**Lowest Common Ancestor of a BST** — walk down: if both target values are smaller go left, both larger go right, otherwise you're at the split point = the LCA.

---

# System Design (Sunday): News Feed — RADIO

An **application** design (vs the component designs of Weeks 5–6). Read the free News Feed case study (GreatFrontEnd) alongside this.

**R — Requirements**
- *Functional:* display a scrollable feed of posts; like/comment/share; create a new post.
- *Non-functional:* performant with a long feed; mobile; accessible; reasonably fresh data.
- *Clarify:* which post types (text/image/video)? infinite scroll or pagination? real-time updates needed?

**A — Architecture** (the classic 4 layers)
- **Store** — app state, mostly server-originated post data (normalized by id).
- **Data access layer** — makes network requests, also caches responses.
- **Feed UI** — the list of posts + the new-post composer.
- **Feed post** — renders one post + interaction buttons (like/comment/share).

**D — Data model**
Posts normalized by id: `{ id, author, content, media, likeCount, liked, commentCount, createdAt }`; plus `pagination cursor`, `loading`, composer state.

**I — Interface (API)**
- `GET /feed?cursor={c}&limit={n}` → `{ posts, nextCursor }` — **cursor-based** pagination, not offset. *Why:* with new posts arriving at the top, offset pagination duplicates/skips items; a cursor is stable.
- `POST /posts` to create; `POST /posts/{id}/like` to interact.

**O — Optimizations & deep dive**
- **Feed loading:** **infinite scroll** via `IntersectionObserver` on a sentinel near the bottom; show skeletons while loading.
- **Rendering performance:** **list virtualization** (windowing) so a 1,000-post feed only mounts what's visible; lazy-load images; code-split heavy post types.
- **Interactions:** **optimistic UI** — bump the like count instantly, roll back on error. Great senior signal.
- **Data freshness / caching:** cache pages in the data layer; normalize so the same post in multiple places updates once.
- **UX & a11y:** pull-to-refresh; semantic `<article>` per post; manage focus; error/empty states.

**60-second summary:** "Store + data-access layer feed a virtualized list of post components; pagination is cursor-based for stability, scrolling is infinite via IntersectionObserver, likes are optimistic with rollback, and images lazy-load."

---

## End-of-week checkpoint
- Explain bubbling/capturing and why delegation scales; implement an Event Emitter.
- Do BFS level-order and validate a BST from memory.
- Build a sortable/filterable/paginated data table.
- Walk through the news feed with RADIO and bring up cursor pagination, virtualization, and optimistic updates unprompted.
