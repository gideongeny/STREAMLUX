import { Component, ErrorInfo, ReactNode } from "react";
import { FiAlertCircle, FiRefreshCw, FiHome } from "react-icons/fi";

// ─── RouteErrorBoundary ───────────────────────────────────────────────────────
// Wraps each lazy-loaded route to catch component-level errors without
// crashing the entire application. Shows a non-blocking, styled fallback UI.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  /** Optional section label shown in the fallback UI e.g. "Movies" */
  section?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteErrorBoundary] Caught error:", error, info.componentStack);
    
    // Auto-reload the page if a chunk fails to load due to a new deployment
    if (
      error.message?.includes('dynamically imported module') || 
      error.message?.includes('chunk') ||
      error.message?.includes('Importing a module script failed')
    ) {
      window.location.reload();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    
    // If it's a chunk error, the page will reload shortly. Show a minimal loading state.
    if (this.state.errorMessage?.includes('dynamically imported module') || this.state.errorMessage?.includes('chunk')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-6">
            <div className="flex flex-col items-center gap-4">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-white/60 text-sm animate-pulse">Syncing new version...</p>
            </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-dark px-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-primary/5 rounded-full" />
            <FiAlertCircle className="text-primary relative z-10" size={42} />
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight mb-2">
              Something went wrong
            </h1>
            {this.props.section && (
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
                {this.props.section}
              </p>
            )}
            <p className="text-gray-500 text-sm leading-relaxed">
              This section encountered an unexpected error. Your other content is
              unaffected.
            </p>
          </div>

          {/* Error detail (dev-friendly) */}
          {this.state.errorMessage && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left">
              <p className="text-[11px] font-mono text-gray-400 break-all line-clamp-3">
                {this.state.errorMessage}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              <FiRefreshCw size={14} />
              Try Again
            </button>
            <a
              href="/"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-2.5 px-6 rounded-xl text-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <FiHome size={14} />
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
