## 2024-05-18 - Imperative Accessibility in React

**Learning:** Imperatively modifying the DOM in a React `useEffect` to add accessibility attributes (e.g., `aria-label`, `title`) is an anti-pattern. This approach fails for components that render dynamically based on state (like tabs or modals) because the `useEffect` runs only once (if given an empty dependency array), so dynamically generated elements remain unlabelled.

**Action:** Always add accessibility attributes declaratively within the JSX structure so they are naturally bound to the components, regardless of when or how they are rendered.