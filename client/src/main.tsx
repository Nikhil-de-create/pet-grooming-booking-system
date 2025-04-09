import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Initializing application...');

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('Root element found, rendering app...');
  createRoot(rootElement).render(<App />);
} else {
  console.error('Root element not found!');
}
