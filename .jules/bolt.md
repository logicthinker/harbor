## 2025-05-18 - Component Unification Anti-Pattern
**Learning:** The frontend architecture functions as a massive single component monolith (`src/main.tsx`). In such architectures, array filtering and string manipulations inside the render body (like lowercase operations on lists) execute on *every* keystroke across the entire app state, causing severe input lag.
**Action:** Always eagerly identify and hoist non-variant expressions (like `search.toLowerCase()`) out of iteration loops and strictly wrap heavy array filters/maps with `useMemo` when working in large unified components.
