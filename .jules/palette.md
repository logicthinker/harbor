## 2024-05-19 - Imperative Accessibility Injection in React
**Learning:** Found a pattern where `aria-label` attributes were being imperatively injected into DOM nodes via `useEffect` instead of declaratively in the JSX. This causes hydration mismatches, makes the attributes invisible in the server-rendered HTML, and violates React's declarative model.
**Action:** Always add ARIA attributes (like `aria-label` and `aria-describedby`) directly within the component's JSX markup to ensure they are available immediately upon render and compatible with React's diffing algorithm.
