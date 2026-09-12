## 2024-05-24 - Accessibility via Declarative Attributes
**Learning:** Adding accessibility attributes (like `aria-label`) dynamically using imperative DOM manipulation (e.g. `useEffect` + `document.querySelectorAll`) in React is prone to issues. As the UI re-renders, components unmount, mount, and state changes, these dynamically added attributes may get lost or applied incorrectly.
**Action:** Always add ARIA attributes and other accessibility enhancements declaratively within the JSX structure directly on the element elements.
