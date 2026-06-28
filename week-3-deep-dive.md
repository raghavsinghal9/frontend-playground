# Week 3 — Deep Dive

**Tracks:** DSA (stack & queue, intro monotonic stack) · JavaScript (prototypes, prototypal inheritance, `new`, classes + polyfills) · Machine coding (Autocomplete / Typeahead) · System design (not yet — light Sunday).

**Goal by Sunday:** you can explain the prototype chain and what `new` actually does; you can implement `new` and `Object.create`; and you can build a debounced autocomplete with keyboard navigation.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Valid Parentheses | Prototypes & the prototype chain |
| Tue | Min Stack | Prototypal inheritance; `__proto__` vs `prototype` |
| Wed | Evaluate Reverse Polish Notation | What `new` does → implement `myNew` |
| Thu | Daily Temperatures (monotonic stack) | `Object.create` → implement it; ES6 classes as sugar |
| Fri | Implement Queue using Stacks + review | Review + predict-the-output on prototype lookup |
| **Sat** | **Machine coding: Autocomplete / Typeahead** | |
| **Sun** | **Review + 2nd pass + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript concepts (read):**
- Prototypal inheritance — https://javascript.info/prototype-inheritance
- `F.prototype` (how `new` uses it) — https://javascript.info/function-prototype
- Classes — https://javascript.info/class
- MDN — the `new` operator — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new

**DSA — solve on LeetCode:**
- Valid Parentheses — https://leetcode.com/problems/valid-parentheses/
- Min Stack — https://leetcode.com/problems/min-stack/
- Evaluate Reverse Polish Notation — https://leetcode.com/problems/evaluate-reverse-polish-notation/
- Daily Temperatures — https://leetcode.com/problems/daily-temperatures/
- Implement Queue using Stacks — https://leetcode.com/problems/implement-queue-using-stacks/

**Machine coding — build:** sandbox (https://codesandbox.io). Reuse your Week 1 `debounce`. Guided version: GreatFrontEnd → Questions → User Interface (https://www.greatfrontend.com).

---

# JavaScript Track

## 1. Prototypes & the prototype chain
Every JS object has a hidden link, `[[Prototype]]` (exposed as `__proto__`), to another object. When you read a property, JS checks the object, then its prototype, then *its* prototype — up the **chain** — until found or `null`. That's prototypal inheritance: objects inherit directly from other objects.

```js
const animal = { eats: true };
const dog = Object.create(animal);   // dog.__proto__ === animal
dog.barks = true;
dog.eats;  // true — found on animal via the chain
```

**`prototype` vs `__proto__` (the classic confusion):**
- `__proto__` is the link an **object** uses for lookups.
- `prototype` is a property on **functions** — the object that becomes the `__proto__` of instances created with `new`.
```js
function Dog() {}
const d = new Dog();
d.__proto__ === Dog.prototype; // true
```

## 2. What `new` actually does (4 steps)
`new Foo(args)`:
1. Creates a fresh empty object.
2. Links that object's `[[Prototype]]` to `Foo.prototype`.
3. Calls `Foo` with `this` = the new object.
4. Returns the new object — **unless** `Foo` explicitly returns its own object.

**Implement `myNew`:**
```js
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);   // steps 1 + 2
  const result = Constructor.apply(obj, args);        // step 3
  return (result && typeof result === 'object') ? result : obj; // step 4
}
```

**Implement `Object.create`** (pre-ES5 trick — shows you understand the link):
```js
function objectCreate(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

## 3. ES6 classes = syntactic sugar
`class` is a cleaner syntax over the prototype mechanism — methods go on `Class.prototype`, `extends` sets up the chain, `super` calls the parent. Underneath, it's still prototypes. Being able to say "classes are sugar over prototypal inheritance" is the expected one-liner.

---

# Machine Coding Track (Saturday)

## Build — Autocomplete / Typeahead
**Requirements:** debounced input → fetch suggestions → show a dropdown → arrow-key navigation → Enter/click to select. Handle empty query.

```html
<input id="search" autocomplete="off" />
<ul id="dropdown" class="dropdown"></ul>
```
```js
// reuse debounce() from Week 1
function createAutocomplete(input, dropdown, fetchSuggestions) {
  let items = [], active = -1;

  const onInput = debounce(async () => {
    const q = input.value.trim();
    if (!q) return render([]);
    items = await fetchSuggestions(q);     // returns array of strings
    active = -1;
    render(items);
  }, 300);

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', (e) => {
    if (!items.length) return;
    if (e.key === 'ArrowDown') active = Math.min(active + 1, items.length - 1);
    else if (e.key === 'ArrowUp') active = Math.max(active - 1, 0);
    else if (e.key === 'Enter' && active >= 0) return select(items[active]);
    else if (e.key === 'Escape') return render([]);
    else return;
    e.preventDefault();
    highlight();
  });

  function render(list) {
    dropdown.innerHTML = '';
    list.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      li.addEventListener('mousedown', () => select(item)); // mousedown beats input blur
      dropdown.appendChild(li);
    });
  }
  function highlight() {
    [...dropdown.children].forEach((li, i) => li.classList.toggle('active', i === active));
  }
  function select(item) { input.value = item; render([]); }
}
```
**Talking points:** debounce avoids a request per keystroke; `mousedown` (not `click`) fires before the input loses focus; cache results per query as an enhancement; handle race conditions (ignore a response if the query changed) — a great senior-level addition to mention.

---

# DSA Track

## Pattern — Stack & Queue
**Stack** (LIFO) — matching/undo/nesting problems, and "process until you find a bigger/smaller element." **Queue** (FIFO) — order-preserving processing, BFS. A **monotonic stack** keeps elements in increasing/decreasing order to answer "next greater/smaller element" in O(n).

## Problems

**Valid Parentheses** — *stack.* Push openers; on a closer, the top must be its match.
```js
function isValid(s) {
  const stack = [];
  const match = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (stack.pop() !== match[ch]) return false;
  }
  return stack.length === 0;
}
// O(n) time, O(n) space
```

**Min Stack** — *stack + tracking.* Keep a parallel stack (or store `[val, currentMin]` pairs) so `getMin()` is O(1).

**Evaluate Reverse Polish Notation** — *stack.* Push numbers; on an operator, pop two, apply, push the result.

**Daily Temperatures** — *monotonic stack.* Keep a decreasing stack of indices; when a warmer day arrives, pop and record the gap.
```js
function dailyTemperatures(temps) {
  const res = new Array(temps.length).fill(0);
  const stack = [];                       // indices, temps decreasing
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack.at(-1)]) {
      const j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}
// O(n) time, O(n) space
```

**Implement Queue using Stacks** — *two stacks.* Push to an "in" stack; for pop/peek, if the "out" stack is empty, pour everything from "in" into "out" (reversing order). Amortized O(1).

---

## End-of-week checkpoint
Without looking, you can:
- Draw the prototype chain for `new Dog()` and explain `__proto__` vs `prototype`.
- List the 4 steps of `new` and implement `myNew`.
- Build a debounced autocomplete with keyboard nav from scratch.
- Recognize a stack problem ("matching / nesting / next-greater") and explain when a monotonic stack gives O(n).
