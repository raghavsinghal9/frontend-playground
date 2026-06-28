# Week 5 — Deep Dive

**Tracks:** DSA (linked lists) · JavaScript (Promises & async/await + polyfills) · Machine coding (Modal, Toast queue) · **System design (Autocomplete — your first RADIO walkthrough).**

**Goal by Sunday:** you can implement `Promise.all`/`race`/`allSettled`; you can reverse a linked list and use fast/slow pointers; and you can walk through designing an autocomplete component using RADIO end-to-end.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Reverse Linked List | Promises deeply (states, chaining) |
| Tue | Linked List Cycle (fast/slow) | `async`/`await`, error handling |
| Wed | Middle of the Linked List | Implement `Promise.all` |
| Thu | Merge Two Sorted Lists | Implement `Promise.race` + `allSettled` |
| Fri | Remove Nth Node From End + review | Review |
| **Sat** | **Machine coding: Modal → Toast queue** | |
| **Sun** | **System design: Autocomplete (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Promises — https://javascript.info/promise-basics · async/await — https://javascript.info/async-await · Promise API — https://javascript.info/promise-api
**JavaScript (solve):** Promise.all — https://bigfrontend.dev/problem/implement-Promise-all · Promise.race — https://bigfrontend.dev/problem/implement-Promise-race · Promise.allSettled — https://bigfrontend.dev/problem/implement-Promise-allSettled
**DSA (LeetCode):** Reverse Linked List — https://leetcode.com/problems/reverse-linked-list/ · Linked List Cycle — https://leetcode.com/problems/linked-list-cycle/ · Middle of the Linked List — https://leetcode.com/problems/middle-of-the-linked-list/ · Merge Two Sorted Lists — https://leetcode.com/problems/merge-two-sorted-lists/ · Remove Nth Node From End — https://leetcode.com/problems/remove-nth-node-from-end-of-list/
**System design (read — free):** RADIO framework — https://www.greatfrontend.com/front-end-system-design-playbook/framework · Autocomplete case study — https://www.greatfrontend.com/questions/system-design/autocomplete · FE Handbook system design — https://www.frontendinterviewhandbook.com/front-end-system-design

---

# JavaScript Track

## Promises & async/await (the essentials)
A Promise is an object representing a future value, in one of three states: **pending → fulfilled** or **pending → rejected** (settled once, never changes). `.then(onFulfilled, onRejected)`, `.catch`, `.finally` chain; each `.then` returns a new promise (chaining). `async`/`await` is sugar: `await p` pauses the function until `p` settles and resumes as a microtask; wrap in `try/catch` for errors.

## Implement `Promise.all`
Resolves to an array of all results in order; rejects as soon as any rejects.
```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (val) => { results[i] = val; if (--remaining === 0) resolve(results); },
        reject                       // first rejection rejects the whole thing
      );
    });
  });
}
```

## Implement `Promise.race` and `Promise.allSettled`
```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => Promise.resolve(p).then(resolve, reject)); // first to settle wins
  });
}

function promiseAllSettled(promises) {
  return Promise.all(promises.map((p) =>
    Promise.resolve(p).then(
      (value) => ({ status: 'fulfilled', value }),
      (reason) => ({ status: 'rejected', reason })   // never rejects — always resolves
    )
  ));
}
```
**Key contrast to say out loud:** `all` fails fast on the first rejection; `allSettled` waits for everyone and reports each outcome.

---

# Machine Coding Track (Saturday)

## Build 1 — Modal / Dialog
**Requirements:** open/close, close on backdrop click and `Escape`, trap focus, restore focus on close.
```js
function openModal(contentEl) {
  const lastFocused = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.append(contentEl);
  backdrop.append(dialog);
  document.body.append(backdrop);

  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);   // cleanup!
    lastFocused?.focus();                             // restore focus
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  dialog.querySelector('button, a, input')?.focus();   // move focus in
  return close;
}
```
**Talking points:** focus management + `aria-modal` for accessibility; remove listeners on close (leak prevention); full focus-trap (Tab cycling) as an enhancement.

## Build 2 — Toast notification queue
**Requirements:** show stacked toasts, auto-dismiss after N ms, support multiple at once.
```js
function createToaster(container, duration = 3000) {
  return function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.append(el);
    const timer = setTimeout(() => el.remove(), duration);
    el.addEventListener('click', () => { clearTimeout(timer); el.remove(); });
  };
}
```

---

# DSA Track — Linked Lists

**Idea:** pointer manipulation. Two staple techniques: **iterative reversal** (track prev/curr/next) and **fast/slow pointers** (cycle detection, middle, nth-from-end). A **dummy head** node simplifies edge cases when the head might change.

**Reverse Linked List** — *iterative reversal.*
```js
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;   // save
    curr.next = prev;         // reverse pointer
    prev = curr; curr = next; // advance
  }
  return prev;
}
// O(n) time, O(1) space
```

**Linked List Cycle** — *Floyd's fast/slow.* If they ever meet, there's a cycle.
```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
// O(n) time, O(1) space
```

**Middle of the Linked List** — fast moves 2×, slow 1×; when fast hits the end, slow is at the middle.
**Merge Two Sorted Lists** — dummy head; splice the smaller node each step.
**Remove Nth Node From End** — fast pointer n ahead, then move both until fast ends; slow lands before the target.

---

# System Design (Sunday): Autocomplete — full RADIO walkthrough

> Read the GreatFrontEnd autocomplete case study (link above) alongside this. Autocomplete is THE canonical first one — master it and the techniques transfer everywhere.

**R — Requirements**
- *Functional:* text input; fetch suggestions as the user types; show results in a popup; select via click or keyboard; the component should be generic/reusable.
- *Non-functional:* feels instant; handles rapid keystrokes without flooding the network; accessible (keyboard + screen reader); works on mobile.
- *Clarify:* min query length? number of results? debounce time? is the API given?

**A — Architecture (components)**
- **Input** — controlled text field, emits query changes.
- **Results popup / list** — renders suggestions, manages highlighted item.
- **Result item** — one suggestion (customizable render).
- **Controller** — orchestrates input → fetch → results, holds state.
- **Data layer** — makes the network request, holds a cache.

**D — Data model / state**
`query`, `results[]`, `loading`, `error`, `activeIndex` (keyboard highlight), and a `cache` (Map of query → results).

**I — Interface (API + props)**
- Server: `GET /search?q={query}&limit={n}` → `[{ id, label, ... }]`.
- Component props: `apiUrl`, `numResults`, `debounceMs`, `minChars`, `onChange`, `onSelect`, custom `renderItem`, event hooks (`input`/`focus`/`blur`).

**O — Optimizations & deep dive** (spend most of your time here)
- **Network:** debounce input (one request per pause); **cancel or ignore stale responses** so an earlier slow response can't overwrite a newer one (race condition — huge talking point); request timeout → error state; minimum query length.
- **Caching:** client-side cache keyed by query so repeated queries are instant; bounded size / TTL to avoid stale or unbounded memory.
- **Performance:** limit number of results; **virtualize** very long lists; reserve popup space to avoid layout shift.
- **UX:** loading / empty / error states; highlight the matched substring; keyboard nav (↑↓ to move, Enter to select, Esc to close).
- **Accessibility:** `role="combobox"` on input, `role="listbox"`/`option` on results, `aria-activedescendant` for the highlighted item, announce result counts.

**The 60-second summary you'd give:** "Input feeds a debounced controller that calls a cached data layer; the data layer guards against out-of-order responses; results render in an accessible listbox with keyboard nav, and I'd virtualize if the list gets long."

---

## End-of-week checkpoint
- Implement `Promise.all` and explain `all` vs `allSettled`.
- Reverse a linked list and detect a cycle with fast/slow pointers, from memory.
- Build a Modal (with focus + Esc + cleanup) and a Toast queue.
- Walk through autocomplete with RADIO and name the race-condition + caching concerns unprompted.
