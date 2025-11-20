import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Main script executing...');

// Safety timeout: If App doesn't render in 3 seconds, show error
const mountTimeout = setTimeout(() => {
    const root = document.getElementById('root');
    if (root && root.innerText.includes('Loading BulletBase')) {
        console.error("React mount timed out. Possible import error or silent crash.");
    }
}, 3000);

// Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error Boundary Caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full bg-red-50 text-red-800">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <pre className="text-xs bg-white p-4 rounded border border-red-200 w-full overflow-auto mb-4">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('FATAL: #root element not found');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    clearTimeout(mountTimeout);
    console.log('React mounted successfully.');
  } catch (err: any) {
    console.error('Failed to mount React app:', err);
  }
}