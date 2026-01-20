import React from 'react';
import { createRoot } from 'react-dom/client'; // Changed from default import
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement); // Using named import 'createRoot'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);