## 2024-03-24 - [Monolithic Component Rendering Bottleneck]
**Learning:** Monolithic components in this architecture can suffer from significant UI stuttering when O(N) operations (like searching arrays, filtering large lists, or string splitting large response payloads) run synchronously on every state change (e.g., typing in a search bar).
**Action:** Always wrap expensive invariant calculations and string processing in `useMemo` in large React components, and hoist loop invariants out of iterations to prevent redundant processing.
