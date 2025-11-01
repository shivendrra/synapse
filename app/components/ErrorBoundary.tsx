import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Changed from `React.Component` to destructuring `Component` and extending it directly.
// This resolves a potential TypeScript resolution issue that could cause the
// "Property 'props' does not exist" error.
// FIX: The destructured `Component` might not be resolved correctly by TypeScript in some environments.
// Using `React.Component` directly is a more robust way to extend a class component and ensures `props` are correctly typed.
class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-center p-8">
          <div className="max-w-md">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops! Something went wrong.</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;