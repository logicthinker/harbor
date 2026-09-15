## $(date +%Y-%m-%d) - Expensive operations in React components

**Learning:** The main React application in `src/main.tsx` functions as a large monolith. We need to be careful of unmemoized and unhoisted operations to prevent UI stuttering. In `src/main.tsx`, `visibleRequests` was filtering with `search.toLowerCase()` repeatedly inside a `.filter` block which caused the lowering of characters during every request scan for the length of `project.requests`, which scales badly.

**Action:** Always hoist invariant calculations out of iteration loops. Ensure values like `env` and `visibleRequests` are memoized using `useMemo` so that the find operation is bounded for that specific parameter.
