## 2024-05-24 - Avoid Imperative DOM Manipulation for Accessibility in React
**Learning:** Imperatively updating accessibility attributes (like `aria-label`) using `document.querySelector` inside a `useEffect` hook in React can lead to lost attributes across re-renders or when components mount/unmount conditionally. React is declarative and expects state-driven rendering.
**Action:** Always add accessibility attributes directly in the JSX so they persist reliably and follow React's declarative pattern.
