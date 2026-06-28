# Week 6 — Deep Dive

**Tracks:** DSA (recursion & backtracking) · JavaScript (array-method polyfills + currying) · Machine coding (Nested Comments / Tree view) · **System design (Image Carousel — a UI-component design).**

**Goal by Sunday:** you can implement `map`/`filter`/`reduce` and `curry`; you can solve subsets/permutations with backtracking; and you can design a carousel component, reasoning about lazy-loading and accessibility.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Subsets | Implement `map` + `filter` |
| Tue | Permutations | Implement `reduce` |
| Wed | Combination Sum | `forEach` + `flat`; currying concept |
| Thu | Generate Parentheses | Implement `curry` |
| Fri | Word Search + review | Review |
| **Sat** | **Machine coding: Nested Comments / Tree view** | |
| **Sun** | **System design: Image Carousel (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Array methods — https://javascript.info/array-methods · Currying & partials — https://javascript.info/currying-partials
**JavaScript (solve):** implement the polyfills below yourself, then check; more JS practice — https://bigfrontend.dev
**DSA (LeetCode):** Subsets — https://leetcode.com/problems/subsets/ · Permutations — https://leetcode.com/problems/permutations/ · Combination Sum — https://leetcode.com/problems/combination-sum/ · Generate Parentheses — https://leetcode.com/problems/generate-parentheses/ · Word Search — https://leetcode.com/problems/word-search/
**System design (read — free):** Types of questions (UI components) — https://www.greatfrontend.com/front-end-system-design-playbook/types-of-questions · System design playbook — https://www.greatfrontend.com/front-end-system-design-playbook · Questions hub — https://www.greatfrontend.com/questions/system-design

---

# JavaScript Track

## Array-method polyfills
Implementing these proves you understand callbacks, `this`, and iteration.
```js
Array.prototype.myMap = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this);  // skip holes
  }
  return out;
};

Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  }
  return out;
};

Array.prototype.myReduce = function (cb, initial) {
  let acc, start = 0;
  if (arguments.length >= 2) { acc = initial; }
  else { acc = this[0]; start = 1; }              // no initial → first element
  for (let i = start; i < this.length; i++) acc = cb(acc, this[i], i, this);
  return acc;
};
```
**Edge cases to mention:** skipping sparse-array holes; `reduce` with no initial value on an empty array throws.

## Currying
Transform `f(a, b, c)` into `f(a)(b)(c)` — collect args until there are enough, then call.
```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried.apply(this, [...args, ...next]);
  };
}
// curry((a,b,c) => a+b+c)(1)(2)(3) === 6  and  (1,2)(3) === 6
```
`fn.length` (the function's declared arity) is what tells you when you have enough arguments.

---

# Machine Coding Track (Saturday)

## Build — Nested Comments / Tree view
**Requirements:** render an arbitrarily nested comment tree; expand/collapse; (stretch: reply/delete). The natural solution is **recursion** — a component that renders itself for replies.
```js
// data: { id, text, replies: [ {…}, {…} ] }
function renderComment(comment) {
  const li = document.createElement('li');

  const text = document.createElement('span');
  text.textContent = comment.text;
  li.append(text);

  if (comment.replies?.length) {
    const toggle = document.createElement('button');
    toggle.textContent = 'Toggle';
    const childUl = document.createElement('ul');
    comment.replies.forEach((reply) => childUl.append(renderComment(reply))); // recursion
    toggle.addEventListener('click', () => {
      childUl.hidden = !childUl.hidden;
    });
    li.append(toggle, childUl);
  }
  return li;
}

function renderThread(rootComments, mount) {
  const ul = document.createElement('ul');
  rootComments.forEach((c) => ul.append(renderComment(c)));
  mount.append(ul);
}
```
**Talking points:** recursion mirrors the tree structure; for very deep/large trees, lazy-render children on expand; keep a single data source and re-render on changes.

---

# DSA Track — Recursion & Backtracking

**Idea:** build a partial solution, recurse, and **undo (backtrack)** before trying the next choice. The skeleton is always: *base case → for each choice → choose → recurse → un-choose.*

**Subsets** — include/exclude each element.
```js
function subsets(nums) {
  const res = [];
  function backtrack(start, path) {
    res.push([...path]);                  // every node is a valid subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);                 // choose
      backtrack(i + 1, path);             // recurse
      path.pop();                         // un-choose
    }
  }
  backtrack(0, []);
  return res;
}
```

**Permutations** — try every unused element at each position.
```js
function permute(nums) {
  const res = [], used = new Array(nums.length).fill(false);
  function backtrack(path) {
    if (path.length === nums.length) { res.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      backtrack(path);
      path.pop(); used[i] = false;
    }
  }
  backtrack([]);
  return res;
}
```

**Combination Sum** — like subsets, but you may reuse an element (recurse with `i`, not `i+1`) and prune when the remaining target goes negative.
**Generate Parentheses** — backtrack adding `(` while `open < n`, and `)` while `close < open`.
**Word Search** — DFS on the grid from each cell, marking visited and un-marking on backtrack.

---

# System Design (Sunday): Image Carousel — RADIO

This is a **UI component** design (vs autocomplete which was too). For components, emphasize subcomponents, props/API, internal state, and then performance + a11y.

**R — Requirements**
- *Functional:* show images one at a time; next/prev; indicators (dots); optional autoplay + loop.
- *Non-functional:* smooth transitions; fast image loading; accessible; responsive; touch/swipe on mobile.
- *Clarify:* autoplay by default? infinite loop? how many images (affects lazy-loading)?

**A — Architecture (subcomponents)**
Carousel container · Slide (image) · Controls (prev/next) · Indicators (dots) · autoplay timer.

**D — State / props**
- State: `currentIndex`, `isPlaying`, `timerRef`.
- Props/API: `images[]`, `autoPlay`, `interval`, `loop`, `showDots`, `onChange`; methods `next()`, `prev()`, `goTo(i)`.

**I — Interface**
Minimal external API: the `images` array and the config props above; expose `next/prev/goTo` for programmatic control.

**O — Optimizations & deep dive**
- **Performance (the big one):** **lazy-load** images — load the current + adjacent slides, preload the next as you go; use `srcset`/responsive images; reserve a fixed aspect-ratio box to avoid layout shift; animate with CSS `transform` (GPU-accelerated), not `left`.
- **UX:** pause autoplay on hover/focus; keyboard arrows; swipe gestures; respect `prefers-reduced-motion`.
- **Accessibility:** `aria-roledescription="carousel"`, label each slide ("3 of 8"), a live region announcing changes, focusable controls.
- **Cleanup:** clear the autoplay interval on unmount (memory-leak prevention — recurring theme).

**60-second summary:** "Container tracks `currentIndex`; controls and dots drive it; I lazy-load current + neighbors and preload ahead, transition with GPU transforms, pause on hover, and make it keyboard + screen-reader accessible — clearing the autoplay timer on teardown."

---

## End-of-week checkpoint
- Implement `map`, `reduce`, and `curry` from memory.
- Solve subsets and permutations with the choose → recurse → un-choose skeleton.
- Build a recursive nested-comments view.
- Walk through the carousel with RADIO and lead the optimization section with lazy-loading + a11y.
