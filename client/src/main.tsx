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

console.log('Initializing application with full App...');

try {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log('Root element found, rendering app...');
    createRoot(rootElement).render(<App />);
  } else {
    console.error('Root element not found!');
  }
} catch (error) {
  console.error('Error rendering React application:', error);
  // Display a fallback error message in the DOM
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
      <h1>Application Error</h1>
      <p>There was a problem loading the Pet Grooming application.</p>
      <p style="color: red;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}
