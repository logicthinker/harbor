## 2026-09-11 - Declarative ARIA labels
**Learning:** Imperative DOM manipulation for accessibility attributes in React (via `useEffect` and `document.querySelectorAll`) is error-prone, brittle, and specifically breaks on conditionally rendered components (like the Authorization select) because the `useEffect` only runs once on mount, missing newly rendered elements.
**Action:** Always add attributes like `aria-label` declaratively within the JSX to ensure they apply regardless of dynamic component lifecycles and conditional rendering.
