## 2024-05-15 - Declarative ARIA in React
**Learning:** Imperative DOM manipulation (e.g., `useEffect` with `document.querySelectorAll`) for accessibility attributes in React applications often fails because attributes are lost or not applied to conditionally rendered elements.
**Action:** Always add accessibility attributes like `aria-label` and `title` declaratively directly within the JSX to ensure they persist across component lifecycles.
