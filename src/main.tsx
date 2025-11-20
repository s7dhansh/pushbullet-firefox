import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('src/main.tsx: Script started');

const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error("Root element #root not found in HTML");

    // Clear existing content (loading spinner)
    rootElement.innerHTML = '';

    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('src/main.tsx: React render called');
  } catch (e: any) {
    console.error('src/main.tsx: Fatal Exception', e);
    const overlay = document.getElementById('error-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      overlay.innerHTML += `<div><strong>Mount Error:</strong> ${e.message}</div>`;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}