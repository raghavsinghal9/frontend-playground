# Week 9 — Deep Dive

**Tracks:** DSA (1D dynamic programming) · JavaScript (modules, generators + `deepClone`/`deepEqual`) · Machine coding (OTP input / Form validation) · **System design (Chat application — real-time).**

**Goal by Sunday:** you can write the 1D DP staples; you can implement deep clone (with circular refs) and deep equal; and you can design a chat app, reasoning about WebSockets, offline queueing, and message ordering.

---

## Day-by-day schedule

| Day | Morning DSA (~75 min) | Morning JS (~45 min) |
|---|---|---|
| Mon | Climbing Stairs | DP intuition: memoization vs tabulation |
| Tue | House Robber | ES modules (ESM) vs CommonJS |
| Wed | Coin Change | Generators & iterables → implement `deepClone` |
| Thu | Longest Increasing Subsequence | Implement `deepEqual` |
| Fri | Review the four | Review |
| **Sat** | **Machine coding: OTP input (or Form validation)** | |
| **Sun** | **System design: Chat application (RADIO) + draft 1 STAR story** | |

---

## 🔗 Where to learn & practice — one click per topic

**JavaScript (read):** Modules — https://javascript.info/modules-intro · Generators — https://javascript.info/generators · Iterables — https://javascript.info/iterable
**JavaScript (solve):** Deep clone — https://www.greatfrontend.com/questions/javascript/deep-clone · Deep equal — https://www.greatfrontend.com/questions/javascript/deep-equal
**DSA (LeetCode):** Climbing Stairs — https://leetcode.com/problems/climbing-stairs/ · House Robber — https://leetcode.com/problems/house-robber/ · Coin Change — https://leetcode.com/problems/coin-change/ · Longest Increasing Subsequence — https://leetcode.com/problems/longest-increasing-subsequence/
**System design (read):** Chat application case study — https://www.greatfrontend.com/questions/system-design · FE Handbook system design — https://www.frontendinterviewhandbook.com/front-end-system-design

---

# JavaScript Track

## Modules & generators (quick)
- **ESM** (`import`/`export`) is the standard: static, tree-shakeable, async-loaded. **CommonJS** (`require`/`module.exports`) is Node's older, synchronous system. Know the difference and that ESM enables tree-shaking.
- **Generators** (`function*` + `yield`) produce values lazily and are pausable; they power custom iterables. Brief but good to recognize:
```js
function* range(start, end) { for (let i = start; i < end; i++) yield i; }
[...range(0, 3)]; // [0, 1, 2]
```

## Implement `deepClone` (handle circular refs)
```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;   // primitives
  if (seen.has(value)) return seen.get(value);                      // circular ref
  if (value instanceof Date) return new Date(value);
  const clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone);
  for (const key of Reflect.ownKeys(value)) clone[key] = deepClone(value[key], seen);
  return clone;
}
```
**Why `WeakMap`:** tracks already-cloned objects so cycles don't infinite-loop, and entries are GC'd. Mention `structuredClone()` exists natively now, but interviewers want the manual version.

## Implement `deepEqual`
```js
function deepEqual(a, b) {
  if (a === b) return true;                            // primitives / same ref
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
}
```

---

# Machine Coding Track (Saturday)

## Build — OTP Input
**Requirements:** N single-character boxes; auto-advance on input; backspace moves back; paste fills all; fire `onComplete` when full.
```js
function createOTP(container, length = 6, onComplete) {
  for (let i = 0; i < length; i++) {
    const input = document.createElement('input');
    input.maxLength = 1; input.inputMode = 'numeric';
    container.append(input);
  }
  const inputs = [...container.querySelectorAll('input')];

  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value && i < length - 1) inputs[i + 1].focus();        // auto-advance
      if (inputs.every((x) => x.value)) onComplete(inputs.map((x) => x.value).join(''));
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) inputs[i - 1].focus(); // back
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const digits = (e.clipboardData.getData('text') || '').slice(0, length).split('');
      digits.forEach((d, j) => (inputs[j].value = d));
      inputs[Math.min(digits.length, length - 1)].focus();
    });
  });
}
```
*(Form-validation alternative: validate on blur + submit, show inline errors, disable submit while invalid — same single-state-source pattern.)*

---

# DSA Track — 1D Dynamic Programming

**Idea:** break a problem into overlapping subproblems and store results. Two styles: **top-down** (recursion + memo) and **bottom-up** (tabulation). The hard part is finding the **recurrence** — "the answer at i in terms of earlier answers."

**Climbing Stairs** — `ways(n) = ways(n-1) + ways(n-2)` (Fibonacci).
```js
function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
// O(n) time, O(1) space
```

**House Robber** — at each house: skip it (keep `prev` best) or rob it (`prevPrev + value`).
```js
function rob(nums) {
  let prev = 0, curr = 0;
  for (const n of nums) [prev, curr] = [curr, Math.max(curr, prev + n)];
  return curr;
}
```

**Coin Change** — `dp[a] = min over coins c of dp[a - c] + 1`.
```js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**Longest Increasing Subsequence** — `dp[i]` = longest ending at i; `dp[i] = 1 + max(dp[j])` for `j < i, nums[j] < nums[i]`. O(n²) (O(n log n) with binary search is the stretch).

---

# System Design (Sunday): Chat application — RADIO

The defining axis here is **real-time**. Read the chat case study alongside.

**R — Requirements**
- *Functional:* conversation list; message thread; send/receive in real time; message history; online + typing indicators.
- *Non-functional:* low latency; works offline (queue + sync); scales to long threads; accessible.
- *Clarify:* 1:1 only or group chats? read receipts? media messages?

**A — Architecture**
Store (conversations + messages, normalized) · **real-time connection layer (WebSocket)** · data access layer (REST for history, WS for live) · Conversation list UI · Message thread UI · Composer.

**D — Data model**
Messages by id: `{ id, clientId, conversationId, senderId, text, timestamp, status }` where status ∈ `sending | sent | delivered | read`. Plus connection state, an **outgoing queue** for unsent messages, and a pagination cursor per conversation.

**I — Interface**
- **WebSocket events:** `message:new`, `typing`, `presence`, and an `ack` for sent messages.
- **REST:** `GET /conversations`, `GET /conversations/{id}/messages?before={cursor}`, send via WS (fallback POST).

**O — Optimizations & deep dive**
- **Transport:** **WebSocket** for bidirectional low latency (vs polling/SSE); reconnect with exponential backoff; heartbeat/ping to detect drops.
- **Offline & reliability:** queue outgoing messages, **optimistic send** (show immediately as "sending"), assign a **client-generated id** to dedupe on the server, sync the queue on reconnect.
- **Ordering/consistency:** handle out-of-order delivery (sort by server timestamp); reconcile optimistic messages with server echoes via `clientId`.
- **History pagination:** load older messages on scroll-up (reverse pagination) while **preserving scroll position**; virtualize very long threads.
- **A11y/UX:** live region announcing new messages; typing indicators; focus management in the composer.

**60-second summary:** "A WebSocket layer feeds a normalized store; outgoing messages are optimistic with a client id and an offline queue that syncs on reconnect; history paginates in reverse with preserved scroll; long threads virtualize."

---

## End-of-week checkpoint
- Write Climbing Stairs, House Robber, and Coin Change from memory and explain the recurrence.
- Implement `deepClone` (with circular-ref handling) and `deepEqual`.
- Build an OTP input with auto-advance, backspace, and paste.
- Walk through chat with RADIO and raise WebSockets, optimistic send + offline queue, and message ordering unprompted.
