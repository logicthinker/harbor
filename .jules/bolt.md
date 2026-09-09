## 2024-05-24 - Unmemoized filtering causing React stutters
**Learning:** In a monolithic React app (`src/main.tsx`), seemingly harmless array filters with string manipulation (like `.toLowerCase()` and template literals) inside the render body run on *every single keystroke or state change*, causing noticeable UI stuttering.
**Action:** Always wrap expensive list derivations (filtering, mapping) in `useMemo`, and hoist invariant calculations (like `search.toLowerCase()`) out of the filter callback loop.
