# Week 1 — Deep Dive

**Tracks this week:** DSA (arrays/strings, two pointers, hashing) · JavaScript (execution context, scope, hoisting, closures + `debounce`/`throttle`) · Machine coding (Star Rating, Todo) · System design (not yet — light Sunday).

**Goal by Sunday:** you can explain closures cold and write `debounce`/`throttle` from memory; you can build a small interactive component in vanilla JS without panicking; and the two-pointer + hashing patterns feel automatic.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Two Sum, Contains Duplicate | Execution context, scope, hoisting |
| Tue | Valid Anagram, Group Anagrams | Closures (deep) — read + examples |
| Wed | Reverse String, Valid Palindrome | Implement `debounce` (both variants) |
| Thu | Two Sum II (sorted), 3Sum (intro) | Implement `throttle` + closure interview patterns |
| Fri | Best Time to Buy & Sell Stock + redo any shaky one | Predict-the-output drills + memory leaks |
| **Sat** | **Machine coding: Star Rating → Todo** | |
| **Sun** | **Review week + 2nd pass on weak spots + skim "what is FE system design" + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic (Week 1)

*Read the concept link first, then go solve/build on the practice link. Free unless marked.*

**JavaScript concepts (read):**
- Scope, lexical environment & closures — https://javascript.info/closure
- Hoisting / the old `var` — https://javascript.info/var
- Free topic overviews — https://www.frontendinterviewhandbook.com

**`debounce` / `throttle` (read + solve):**
- Debounce — walkthrough (GreatFrontEnd, freemium) — https://www.greatfrontend.com/questions/javascript/debounce
- Throttle — walkthrough (GreatFrontEnd, freemium) — https://www.greatfrontend.com/questions/javascript/throttle
- Debounce — solve it (BFE.dev #6, free) — https://bigfrontend.dev/problem/implement-basic-debounce
- Throttle — solve it (BFE.dev #4, free) — https://bigfrontend.dev/problem/implement-basic-throttle
- Stretch — debounce w/ leading & trailing (BFE.dev #7) — https://bigfrontend.dev/problem/implement-debounce-with-leading-and-trailing-option
- Stretch — throttle w/ leading & trailing (BFE.dev #5) — https://bigfrontend.dev/problem/implement-throttle-with-leading-and-trailing-option

**DSA — solve on LeetCode (free):**
1. Two Sum — https://leetcode.com/problems/two-sum/
2. Contains Duplicate — https://leetcode.com/problems/contains-duplicate/
3. Valid Anagram — https://leetcode.com/problems/valid-anagram/
4. Group Anagrams — https://leetcode.com/problems/group-anagrams/
5. Reverse String — https://leetcode.com/problems/reverse-string/
6. Valid Palindrome — https://leetcode.com/problems/valid-palindrome/
7. Two Sum II (sorted) — https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
8. Best Time to Buy and Sell Stock — https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
- Stretch — 3Sum — https://leetcode.com/problems/3sum/
- Structured order + free videos — NeetCode 150: https://neetcode.io/practice · Roadmap: https://neetcode.io/roadmap

**Machine coding — build (Saturday):**
- Build in a sandbox — https://codesandbox.io (or just a local `index.html`)
- Free list of component problems — https://github.com/NarendraKoya999/Frontend-Machine-Coding-Interview-Questions
- Guided UI challenges: GreatFrontEnd → Questions → "User Interface" (freemium) — https://www.greatfrontend.com

> **How to use these:** for a concept, *read* the JavaScript.info page, then *solve* the matching BFE.dev/LeetCode problem yourself before checking my solution in this doc. For builds, open a blank sandbox and build from scratch — only peek at my code when stuck.

---

# JavaScript Track

## 1. Execution context & the call stack
When JS runs, it creates a **global execution context**. Every function call creates a **new execution context** pushed onto the **call stack**; when the function returns, its context is popped. Each context has:
- a **variable environment** (where `var` and function declarations live, hoisted),
- a **lexical environment** (the scope chain — how it finds variables in outer scopes),
- a **`this`** binding.

Mental model: the call stack is a stack of "who's running right now." This is also why deep recursion throws "Maximum call stack size exceeded."

## 2. Scope & lexical scoping
- **Global scope** — outside any function.
- **Function scope** — `var` is scoped to the enclosing function.
- **Block scope** — `let`/`const` are scoped to the nearest `{ }`.
- **Lexical scoping** — a function can access variables from where it was *defined* (not where it's called). This is the foundation of closures.

The **scope chain**: when you reference a variable, JS looks in the current scope, then the outer scope, then the next, up to global — stopping at the first match.

## 3. Hoisting
Declarations are processed before code runs:
- `var` → hoisted and initialized to `undefined` (so reading it before assignment gives `undefined`, not an error).
- **function declarations** → fully hoisted (you can call them before they appear).
- `let` / `const` → hoisted but **not initialized** — they sit in the **Temporal Dead Zone (TDZ)** until their declaration line; reading them before throws `ReferenceError`.
- **function expressions / arrow functions** assigned to a variable follow the variable's rules (`var` → `undefined`; `let`/`const` → TDZ).

```js
console.log(a); // undefined  (var hoisted)
var a = 1;

console.log(b); // ReferenceError (TDZ)
let b = 2;

foo();          // works — function declaration hoisted
function foo() {}

bar();          // TypeError: bar is not a function
var bar = () => {};
```

## 4. Closures (the big one)
**A closure is a function bundled together with references to its surrounding (lexical) state.** The inner function keeps access to the outer function's variables **even after the outer function has returned**, because it holds a reference to that variable environment.

**Private state via closure:**
```js
function makeCounter() {
  let count = 0;                 // "private" — only the returned fns can touch it
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c = makeCounter();
c.increment(); c.increment();
c.get(); // 2  — `count` lived on after makeCounter() returned
```

**The classic loop bug (extremely common interview question):**
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // prints 3, 3, 3
}
```
Why: `var` is function-scoped, so all three callbacks close over the **same** `i`, which is `3` by the time they run. Fixes:
```js
for (let i = 0; i < 3; i++) {        // let = new binding each iteration → 0,1,2
  setTimeout(() => console.log(i), 0);
}
```
…or wrap in an IIFE that captures the current value.

**`once` (closure + private flag):**
```js
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}
```

**Interview follow-up — closures and memory leaks (asked a lot in 2026):**
A closure keeps its captured variables alive. If a closure captures a large object or a **DOM node**, and that closure is held by a long-lived thing (a timer, or an event listener that's never removed), the captured data **can't be garbage-collected** → leak. Classic case: `addEventListener` inside a component, capturing component state, never removed on unmount. **Fix:** always clean up listeners/timers (`removeEventListener`, `clearInterval`) when the component/element goes away.

---

## 5. Implement `debounce`
**What it does:** wait until the activity *stops* for `delay` ms, then run the function **once**. Use for: search-as-you-type, window resize end, autosave.

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);                       // cancel the pending call
    timer = setTimeout(() => fn.apply(this, args), delay); // schedule a fresh one
  };
}
```
Every call resets the timer, so the function only fires after a quiet gap.

**Leading-edge variant (fire immediately, then ignore until quiet):**
```js
function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function (...args) {
    const callNow = immediate && timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}
```

**Usage:**
```js
input.addEventListener('input', debounce((e) => search(e.target.value), 300));
```

**Likely follow-ups:** "add a `.cancel()` method", "preserve `this` and arguments" (we did — `apply(this, args)`), "leading vs trailing edge".

---

## 6. Implement `throttle`
**What it does:** run **at most once per `limit` ms** during continuous activity. Use for: scroll, mousemove, resize, rapid button clicks.

**Timer version (leading edge):**
```js
function throttle(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

**Timestamp version:**
```js
function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

**Debounce vs throttle in one line:** debounce = "wait until they stop, then run once"; throttle = "run on a fixed cadence while they keep going." Being able to say *when you'd use each* matters as much as the code.

---

# Machine Coding Track (Saturday)

## The approach (use this every time)
1. **Clarify requirements** (out loud): what should it do, edge cases, can I use a framework?
2. **Sketch the breakdown**: structure (HTML), state (what data), events.
3. **Build the skeleton** → make it work → handle **edge cases** (empty, loading, error, keyboard, accessibility).
4. **Refactor** for readable names and small functions. Narrate throughout.

> Practice in vanilla JS first — many filter rounds disallow frameworks because they want to see DOM/JS mastery. Once comfortable, redo in React/Angular.

## Build 1 — Star Rating
**Requirements:** N stars; hovering highlights stars up to the hovered one; clicking sets the rating; moving the mouse away reverts to the selected rating.

```html
<div id="rating" class="rating" aria-label="Rating"></div>
```
```css
.star { font-size: 2rem; cursor: pointer; color: #ccc; user-select: none; }
.star.filled { color: gold; }
```
```js
function createStarRating(container, total = 5, onChange) {
  let selected = 0;
  const stars = [];

  for (let i = 1; i <= total; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    star.addEventListener('mouseenter', () => highlight(i));
    star.addEventListener('click', () => {
      selected = i;
      highlight(selected);
      onChange && onChange(selected);
    });
    stars.push(star);
    container.appendChild(star);
  }
  container.addEventListener('mouseleave', () => highlight(selected));

  function highlight(n) {
    stars.forEach((s, idx) => s.classList.toggle('filled', idx < n));
  }
}

createStarRating(document.getElementById('rating'), 5, (r) => console.log('Rated', r));
```
**Enhancements to mention:** keyboard accessibility (arrow keys + `role="radiogroup"`), half-star support, read-only mode.

## Build 2 — Todo List
**Requirements:** add a todo, toggle complete, delete, and filter (All / Active / Completed). Handle empty input.

```html
<input id="todo-input" placeholder="Add a task..." />
<button id="add-btn">Add</button>
<div id="filters">
  <button data-filter="all">All</button>
  <button data-filter="active">Active</button>
  <button data-filter="completed">Completed</button>
</div>
<ul id="todo-list"></ul>
```
```js
const state = { todos: [], filter: 'all' };
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;                       // edge case: ignore empty
  state.todos.push({ id: Date.now(), text: trimmed, done: false });
  input.value = '';
  render();
}
function toggleTodo(id) {
  const t = state.todos.find((t) => t.id === id);
  if (t) t.done = !t.done;
  render();
}
function deleteTodo(id) {
  state.todos = state.todos.filter((t) => t.id !== id);
  render();
}
function setFilter(f) { state.filter = f; render(); }

function getVisible() {
  if (state.filter === 'active') return state.todos.filter((t) => !t.done);
  if (state.filter === 'completed') return state.todos.filter((t) => t.done);
  return state.todos;
}

function render() {
  list.innerHTML = '';
  for (const todo of getVisible()) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.style.textDecoration = todo.done ? 'line-through' : 'none';

    const del = document.createElement('button');
    del.textContent = '✕';
    del.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  }
}

document.getElementById('add-btn').addEventListener('click', () => addTodo(input.value));
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(input.value); });
document.getElementById('filters').addEventListener('click', (e) => {
  if (e.target.dataset.filter) setFilter(e.target.dataset.filter);   // event delegation
});

render();
```
**What this demonstrates to an interviewer:** single source of truth (`state`), a pure-ish `render()`, event delegation on the filters, and edge-case handling (empty input). **Enhancements:** edit-in-place, "clear completed", localStorage persistence, item count.

---

# DSA Track

## Pattern A — Hashing (HashMap / Set)
**Idea:** trade memory for **O(1) lookups**. Reach for it when you need "have I seen X?", counts/frequencies, or to find a complement.

## Pattern B — Two Pointers
**Idea:** use two indices instead of nested loops. Two flavors: **opposite ends** (sorted arrays, palindromes, pair sums) and **same direction** (fast/slow, dedupe). Usually turns O(n²) into O(n), often with O(1) space.

## The problems (do these in order)

**1. Two Sum** — *hashing.* Store each value's index; for each number, check if `target - num` was already seen.
```js
function twoSum(nums, target) {
  const seen = new Map();                 // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
// Time O(n), Space O(n)
```

**2. Contains Duplicate** — *set.* Add to a Set; if you ever see one already there, return true. O(n)/O(n).

**3. Valid Anagram** — *hashing (frequency count).* Count letters in `s`, subtract using `t`; all counts must be zero. O(n), O(1) for fixed alphabet.
```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (const ch of t) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
```

**4. Group Anagrams** — *hashing by a canonical key.* Key each word by its sorted letters (or by a letter-count signature); group into a map. O(n·k log k).

**5. Reverse String** — *two pointers, in place.* Swap ends moving inward.
```js
function reverseString(s) {            // s is an array of chars
  let l = 0, r = s.length - 1;
  while (l < r) { [s[l], s[r]] = [s[r], s[l]]; l++; r--; }
}
// Time O(n), Space O(1)
```

**6. Valid Palindrome** — *two pointers.* Skip non-alphanumerics, compare lowercased ends.
```js
function isPalindrome(str) {
  const s = str.toLowerCase();
  let l = 0, r = s.length - 1;
  const ok = (c) => /[a-z0-9]/.test(c);
  while (l < r) {
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}
// Time O(n), Space O(1)
```

**7. Two Sum II (sorted input)** — *two pointers.* Move `l`/`r` inward: if sum too small move `l` right, too big move `r` left. O(n)/O(1). (Contrast with #1 — sorted input unlocks two pointers instead of a hash map.)

**8. Best Time to Buy and Sell Stock** — *one pass.* Track the minimum price so far and the best profit. O(n)/O(1).
```js
function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}
```

**Stretch (intro for next week):** 3Sum — sort, then fix one number and two-pointer the rest.

---

## End-of-week checkpoint
You're on track if you can, without looking:
- Explain what a closure is and walk through the `var` loop bug + fix.
- Write `debounce` and `throttle` and say when you'd use each.
- Build the Star Rating and Todo from a blank file in ~30–40 min each.
- Recognize instantly whether a problem wants **hashing** ("seen it? / counts / complement") or **two pointers** ("sorted / from both ends / in place").

If any of these is shaky, that's what Sunday's second pass is for. Momentum over perfection — keep moving.
