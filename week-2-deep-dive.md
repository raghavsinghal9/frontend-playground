# Week 2 — Deep Dive

**Tracks:** DSA (sliding window, prefix sum) · JavaScript (`this`, `call`/`apply`/`bind`, arrow vs regular + polyfills) · Machine coding (Accordion, Tabs) · System design (not yet — light Sunday).

**Goal by Sunday:** you can explain the 4 rules of `this` and why arrow functions differ; you can write `myCall`/`myApply`/`myBind`; and the sliding-window pattern (fixed + variable) is automatic.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Maximum Average Subarray I (fixed window) | The 4 rules of `this` |
| Tue | Longest Substring Without Repeating Chars | Arrow vs regular functions; losing `this` in callbacks |
| Wed | Minimum Size Subarray Sum | `call` / `apply` / `bind` — usage → implement `myCall` |
| Thu | Longest Repeating Character Replacement | Implement `myApply` + `myBind` |
| Fri | Permutation in String + Subarray Sum = K (prefix sum) | Review + predict-the-output drills on `this` |
| **Sat** | **Machine coding: Accordion → Tabs** | |
| **Sun** | **Review + 2nd pass on weak spots + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript concepts (read):**
- `this` & object methods — https://javascript.info/object-methods
- `call` / `apply` — https://javascript.info/call-apply-decorators
- `bind` (function binding) — https://javascript.info/bind

**JavaScript practice (solve):**
- Implement `Function.prototype.call` (then bind/apply as follow-ups) — https://bigfrontend.dev/problem/create-call-method

**DSA — solve on LeetCode:**
- Maximum Average Subarray I — https://leetcode.com/problems/maximum-average-subarray-i/
- Longest Substring Without Repeating Characters — https://leetcode.com/problems/longest-substring-without-repeating-characters/
- Minimum Size Subarray Sum — https://leetcode.com/problems/minimum-size-subarray-sum/
- Longest Repeating Character Replacement — https://leetcode.com/problems/longest-repeating-character-replacement/
- Permutation in String — https://leetcode.com/problems/permutation-in-string/
- Subarray Sum Equals K (prefix sum) — https://leetcode.com/problems/subarray-sum-equals-k/

**Machine coding — build:** sandbox (https://codesandbox.io) or local `index.html`. Guided versions: GreatFrontEnd → Questions → User Interface (https://www.greatfrontend.com).

---

# JavaScript Track

## 1. The 4 rules of `this`
`this` is decided by **how a function is called**, not where it's defined (except arrows). In order of precedence:

1. **`new` binding** — `new Foo()` → `this` is the brand-new object.
2. **Explicit binding** — `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)` → `this` is `obj`.
3. **Implicit binding** — `obj.method()` → `this` is `obj` (the thing left of the dot).
4. **Default binding** — a plain `fn()` → `this` is `undefined` in strict mode, `globalThis` otherwise.

**Arrow functions ignore all of this** — they have **no own `this`**; they capture `this` lexically from the enclosing scope. That's why arrows are great for callbacks but wrong as object methods:
```js
const obj = {
  name: 'Raghav',
  greetBad: () => console.log(this.name),   // arrow → this is outer scope, not obj → undefined
  greetGood() { console.log(this.name); },  // method → this is obj → 'Raghav'
};
```

**The classic "lost `this`" bug** (asked constantly):
```js
const user = { name: 'R', greet() { console.log(this.name); } };
const fn = user.greet;
fn();            // undefined — detached from user, default binding
setTimeout(user.greet, 0);        // undefined — same reason
setTimeout(() => user.greet(), 0); // 'R' — call site keeps the dot
setTimeout(user.greet.bind(user), 0); // 'R' — bound
```

## 2. `call`, `apply`, `bind`
- `fn.call(thisArg, a, b)` → **invokes** immediately, args listed.
- `fn.apply(thisArg, [a, b])` → **invokes** immediately, args as an array.
- `fn.bind(thisArg, a)` → **returns a new function** with `this` (and optional args) pre-set; call it later.

## 3. Implement the polyfills

**`myCall`** — attach the function as a temporary property of the target, call it, clean up:
```js
Function.prototype.myCall = function (thisArg, ...args) {
  thisArg = thisArg ?? globalThis;
  const ctx = Object(thisArg);          // primitives → wrapper object
  const key = Symbol('fn');             // avoid clobbering existing props
  ctx[key] = this;                      // `this` is the function myCall was called on
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};
```

**`myApply`** — same, but args arrive as an array:
```js
Function.prototype.myApply = function (thisArg, args = []) {
  return this.myCall(thisArg, ...args);
};
```

**`myBind`** — return a new function that remembers `this` + pre-filled args:
```js
Function.prototype.myBind = function (thisArg, ...boundArgs) {
  const fn = this;
  return function (...callArgs) {
    return fn.apply(thisArg, [...boundArgs, ...callArgs]);
  };
};
```
**Follow-up to know:** a real `bind` also works with `new` (the bound `this` is ignored when constructing). Mention it; the simple version above covers 95% of interviews.

---

# Machine Coding Track (Saturday)

## Build 1 — Accordion (single-open)
**Requirements:** clicking a section header opens its panel and closes the others; clicking an open one closes it.
```html
<div class="accordion">
  <div class="item"><button class="header">Section 1</button><div class="panel">Content 1</div></div>
  <div class="item"><button class="header">Section 2</button><div class="panel">Content 2</div></div>
</div>
```
```css
.panel { display: none; } .panel.open { display: block; }
```
```js
const accordion = document.querySelector('.accordion');
accordion.addEventListener('click', (e) => {       // event delegation
  const header = e.target.closest('.header');
  if (!header) return;
  const panel = header.nextElementSibling;
  const wasOpen = panel.classList.contains('open');
  accordion.querySelectorAll('.panel').forEach((p) => p.classList.remove('open')); // close all
  if (!wasOpen) panel.classList.add('open');         // toggle the clicked one
});
```
*Variant to mention:* allow multiple panels open (drop the "close all" line). Accessibility: `aria-expanded` on headers.

## Build 2 — Tabs
**Requirements:** clicking a tab shows its panel and marks it active; only one active at a time.
```html
<div class="tabs">
  <button data-tab="a" class="active">Tab A</button>
  <button data-tab="b">Tab B</button>
</div>
<div data-panel="a">Panel A</div>
<div data-panel="b" hidden>Panel B</div>
```
```js
const tabs = document.querySelector('.tabs');
tabs.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = true));
  btn.classList.add('active');
  document.querySelector(`[data-panel="${btn.dataset.tab}"]`).hidden = false;
});
```

---

# DSA Track

## Pattern — Sliding Window
**Idea:** maintain a window `[left, right]` over an array/string. **Fixed window** (size k) slides by one each step. **Variable window** grows `right`, then shrinks `left` while a condition is violated. Turns many O(n²) scans into O(n).

## Pattern — Prefix Sum
**Idea:** precompute running totals so any range sum is O(1). Combined with a hash map, it answers "how many subarrays sum to k."

## Problems

**Maximum Average Subarray I** — *fixed window.* Sum first k, then slide adding the new element and removing the old.
```js
function findMaxAverage(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k];          // add new, drop old
    best = Math.max(best, sum);
  }
  return best / k;
}
// O(n) time, O(1) space
```

**Longest Substring Without Repeating Characters** — *variable window + set.* Expand `right`; if a duplicate appears, shrink from `left` until it's gone.
```js
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) { seen.delete(s[left]); left++; }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
// O(n) time, O(min(n, charset)) space
```

**Minimum Size Subarray Sum** — *variable window.* Grow until sum ≥ target, then shrink to find the smallest valid window. O(n).

**Longest Repeating Character Replacement** — *variable window + counts.* Window is valid while `(windowLen − maxFreqChar) ≤ k`. O(n).

**Permutation in String** — *fixed window + frequency match.* Slide a window the size of the pattern; compare letter counts. O(n).

**Subarray Sum Equals K** — *prefix sum + hash map.* Track running sum; the count of `(sum − k)` seen so far tells you how many subarrays end here with sum k.
```js
function subarraySum(nums, k) {
  const counts = new Map([[0, 1]]);   // prefix sum 0 seen once
  let sum = 0, total = 0;
  for (const n of nums) {
    sum += n;
    total += counts.get(sum - k) || 0;
    counts.set(sum, (counts.get(sum) || 0) + 1);
  }
  return total;
}
// O(n) time, O(n) space
```

---

## End-of-week checkpoint
Without looking, you can:
- State the 4 `this` rules and explain why an arrow method logs `undefined`.
- Write `myCall` and `myBind`.
- Build the Accordion and Tabs from scratch in ~25 min total.
- Spot a sliding-window problem ("longest/shortest/contains-window over a contiguous run") instantly, and know when prefix-sum + hashmap beats a nested loop.
