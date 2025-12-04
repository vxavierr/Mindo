import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding: 20px;">CRITICAL ERROR: Root element not found</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React Mounted Successfully');
} catch (error) {
  console.error("React Mount Failed:", error);
  rootElement.innerHTML = `<div style="color:red; padding: 20px;">
    <h1>App Crash</h1>
    <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
  </div>`;
}