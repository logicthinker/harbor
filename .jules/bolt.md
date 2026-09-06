## 2024-05-24 - Memoizing expensive operations in Monolithic Component
**Learning:** The main React application in `src/main.tsx` functions as a large monolith. This means state changes (like typing in a search input) trigger full re-renders, causing significant UI stuttering if expensive operations (like `project.requests.filter` or `body.split`) are recalculated on every render.
**Action:** Always use `useMemo` for array filtering, string processing, and other expensive derived state computations in monolithic components to prevent UI blocking during frequent state updates like user input.
