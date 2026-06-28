# Week 4 — Deep Dive

**Tracks:** DSA (binary search + sorting) · JavaScript (event loop, microtasks vs macrotasks) · Machine coding (Carousel / Image Slider) · System design (learn the **RADIO** framework — your runway into Phase 2).

**Goal by Sunday:** you can trace the exact output order of mixed sync / `setTimeout` / Promise code; you can write a bug-free binary search (and "binary search on the answer"); and you understand RADIO before system design starts next week.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Binary Search (nail the template) | Call stack → event loop big picture |
| Tue | Search in Rotated Sorted Array | Macrotasks (`setTimeout`) vs microtasks (Promises) |
| Wed | Find First and Last Position | Predict-the-output drills (mixed) |
| Thu | Koko Eating Bananas (search on answer) | `async`/`await` is microtasks under the hood |
| Fri | Search a 2D Matrix + review | Review + more output drills |
| **Sat** | **Machine coding: Carousel / Image Slider** | |
| **Sun** | **Learn RADIO framework + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript concepts (read):**
- Event loop: microtasks & macrotasks — https://javascript.info/event-loop
- Microtask queue — https://javascript.info/microtask-queue

**JavaScript practice:** predict-the-output quizzes on BFE.dev — https://bigfrontend.dev/quiz

**DSA — solve on LeetCode:**
- Binary Search — https://leetcode.com/problems/binary-search/
- Search in Rotated Sorted Array — https://leetcode.com/problems/search-in-rotated-sorted-array/
- Find First and Last Position — https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
- Koko Eating Bananas — https://leetcode.com/problems/koko-eating-bananas/
- Search a 2D Matrix — https://leetcode.com/problems/search-a-2d-matrix/

**Machine coding — build:** sandbox (https://codesandbox.io). Guided version: GreatFrontEnd → Questions → User Interface (https://www.greatfrontend.com).

**System design (Sunday) — read:** Frontend Interview Handbook → System Design — https://www.frontendinterviewhandbook.com/front-end-system-design

---

# JavaScript Track

## 1. The event loop (the model that explains everything async)
JS runs on **one thread** with a **call stack**. Async work doesn't block it — instead:
- The **call stack** runs synchronous code top to bottom.
- Web APIs (timers, fetch, events) run outside JS and, when done, queue a callback.
- The **macrotask queue** holds `setTimeout`/`setInterval`/I/O/UI event callbacks.
- The **microtask queue** holds Promise `.then`/`catch`/`finally` and `await` continuations.

**The loop:** run all synchronous code → drain **all** microtasks → take **one** macrotask → drain all microtasks again → repeat. **Microtasks always run before the next macrotask.**

## 2. The output-ordering question (asked everywhere)
```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```
Why: `1` and `4` are synchronous (run now). `3` is a microtask (runs after sync, before any timer). `2` is a macrotask (runs last, even at 0 ms).

A harder one to be ready for:
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => {
  console.log('C');
  Promise.resolve().then(() => console.log('D'));
});
console.log('E');
// Output: A, E, C, D, B
```
The microtask queue is drained **fully** (including microtasks queued *during* draining → `D`) before the timer `B`.

## 3. `async`/`await` is just microtasks
`await x` pauses the function and schedules the rest as a **microtask** once `x` settles. So code after an `await` behaves like a `.then` callback for ordering purposes. Being able to say that out loud is the key insight.

---

# Machine Coding Track (Saturday)

## Build — Carousel / Image Slider
**Requirements:** next/prev buttons, looping, auto-play on an interval, pause on hover. (Stretch: dots, swipe.)
```html
<div class="carousel">
  <div class="slide active">1</div>
  <div class="slide">2</div>
  <div class="slide">3</div>
  <button class="prev">‹</button>
  <button class="next">›</button>
</div>
```
```css
.slide { display: none; } .slide.active { display: block; }
```
```js
function createCarousel(root, intervalMs = 3000) {
  const slides = root.querySelectorAll('.slide');
  let index = 0, timer = null;

  function show(i) {
    index = (i + slides.length) % slides.length;          // loop with modulo
    slides.forEach((s, k) => s.classList.toggle('active', k === index));
  }
  function play() { timer = setInterval(() => show(index + 1), intervalMs); }
  function stop() { clearInterval(timer); timer = null; }  // cleanup → no leak

  root.querySelector('.next').addEventListener('click', () => { show(index + 1); });
  root.querySelector('.prev').addEventListener('click', () => { show(index - 1); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);

  show(0); play();
  return { stop };                                          // expose cleanup
}
```
**Talking points:** modulo gives infinite looping; **always `clearInterval` on teardown** (ties straight back to the closure-memory-leak point from Week 1); pause-on-hover for UX; lazy-load images as a perf enhancement.

---

# DSA Track

## Pattern — Binary Search
**Idea:** on a **sorted** space, halve the search range each step → O(log n). Two flavors: searching a sorted array, and **"binary search on the answer"** (guess a value, check feasibility, narrow the range).

**The template — get this exactly right (off-by-one bugs are the #1 failure):**
```js
function search(nums, target) {
  let lo = 0, hi = nums.length - 1;          // inclusive bounds
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // avoids overflow
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
// O(log n) time, O(1) space
```

## Problems

**Binary Search** — the template above.

**Search in Rotated Sorted Array** — *modified binary search.* At each step one half is sorted; decide which half the target lies in and discard the other. O(log n).

**Find First and Last Position** — *two binary searches.* One biased left (first occurrence), one biased right (last). O(log n).

**Koko Eating Bananas** — *binary search on the answer.* The "space" is eating-speed 1…max; binary-search the smallest speed that finishes in time, checking feasibility each guess. Recognizing "minimize/maximize a value subject to a feasibility check" = binary search on the answer is the key skill.

**Search a 2D Matrix** — *binary search on a flattened index.* Treat the m×n matrix as one sorted array of length m·n and map `mid` back to `[row, col]`. O(log(m·n)).

---

# System Design (Sunday): learn RADIO

You won't *do* a full design this week — just internalize the framework so Week 5 isn't a cold start. **RADIO** is the script you walk through for any "design X" prompt:

- **R — Requirements:** clarify functional (what it does) + non-functional (scale, performance, devices, accessibility). Ask questions; don't assume.
- **A — Architecture:** the components and how they're organized; client vs server responsibilities.
- **D — Data model:** what state each component holds; server state vs client/UI state.
- **I — Interface:** API contracts (endpoints, request/response shapes) and the events/props between components.
- **O — Optimizations:** performance (lazy load, virtualization, caching, code splitting), accessibility, error/loading/empty states, edge cases.

Read the Frontend Interview Handbook system-design intro (link above) and just get comfortable with these five headings. Next week you apply them to autocomplete.

---

## End-of-week checkpoint
Without looking, you can:
- Predict the output of mixed sync / `setTimeout` / Promise code and explain microtasks-before-macrotasks.
- Write the binary-search template bug-free and explain "binary search on the answer."
- Build the carousel (loop + autoplay + pause + cleanup) from scratch.
- Recite the five RADIO steps from memory.

**That completes Phase 1.** Your DSA should feel warm again, your JS fundamentals solid, and you should have ~8 components built. Phase 2 is where system design begins in earnest.
