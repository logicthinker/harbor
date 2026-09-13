## 2024-10-25 - Avoid imperative DOM manipulation for accessibility attributes in React
**Learning:** Adding accessibility attributes (like `aria-label`) imperatively via `useEffect` and `document.querySelectorAll` fails when components re-render or mount conditionally. This results in inaccessible elements during dynamic changes.
**Action:** Always declare accessibility attributes directly in the JSX, ensuring they are robust against component lifecycle changes.
