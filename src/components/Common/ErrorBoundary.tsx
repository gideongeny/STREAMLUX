import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { MdErrorOutline } from 'react-icons/md';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, recovering: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, recovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Suppress known non-critical platform/webview warnings
    const errorMessage = error?.message || '';
    const isNonCritical =
      errorMessage.includes('ResizeObserver') ||
      errorMessage.includes('Non-Error promise rejection') ||
      errorMessage.includes('client is offline') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('script error');

    if (isNonCritical) {
      this.setState({ hasError: false, error: null });
      return;
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRecovery = () => {
    this.setState({ recovering: true });

    // Auto-recovery: Clear sensitive local storage that might be corrupting state
    try {
      const keysToKeep = ['theme_primary_color', 'isSignedIn', 'auth_user'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) localStorage.removeItem(key);
      });
      sessionStorage.clear();
    } catch (e) {
      console.warn('Recovery storage clear failed:', e);
    }

    // Short delay for visual feedback then reload
    setTimeout(() => {
      window.location.href = window.location.origin;
    }, 800);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full tw-flex-center bg-[#050505] p-6 text-center overflow-hidden relative">
          {/* Animated Background Accents */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

          <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl relative z-10 transition-all duration-500 hover:border-white/20">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl tw-flex-center mx-auto mb-8 animate-bounce">
              <MdErrorOutline size={42} className="text-red-500" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">System Anomaly</h2>
            <p className="text-white/60 mb-8 leading-relaxed text-sm">
              {this.state.error?.message?.includes('chunk')
                ? "The application was updated. A reload is required to sync systems."
                : "An unexpected error occurred. Our auto-recovery system can attempt to stabilize your session."}
            </p>

            <button
              onClick={this.handleRecovery}
              disabled={this.state.recovering}
              className="group w-full py-4 bg-primary hover:bg-primary-light text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-primary/20"
            >
              {this.state.recovering ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <BiRefresh size={24} className="group-hover:rotate-180 transition-transform duration-500" />
              )}
              {this.state.recovering ? "Stabilizing..." : "Initialize Recovery"}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 text-white/40 hover:text-white/80 transition-colors text-xs font-medium uppercase tracking-widest"
            >
              Force Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

