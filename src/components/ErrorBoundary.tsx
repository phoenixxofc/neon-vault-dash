import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-neon-red p-10 font-mono z-[1000]">
          <h2 className="text-4xl mb-4">CRITICAL_SYSTEM_FAILURE</h2>
          <pre className="text-xs bg-red-900/20 p-4 border border-neon-red overflow-auto max-w-full">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-8 px-6 py-2 border border-neon-red hover:bg-neon-red hover:text-black transition-all"
            onClick={() => window.location.reload()}
          >
            REBOOT_SYSTEM
          </button>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
