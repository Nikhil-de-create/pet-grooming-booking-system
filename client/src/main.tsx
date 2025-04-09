import { createRoot } from "react-dom/client";
import TestApp from "./TestApp"; // Import the test app instead
import "./index.css";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Initializing application with TestApp...');

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('Root element found, rendering test app...');
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error('Root element not found!');
}
