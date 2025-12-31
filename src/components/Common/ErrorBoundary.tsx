import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showError: boolean;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private errorTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Don't show error immediately - wait 2 seconds to allow async operations to complete
    this.errorTimeout = setTimeout(() => {
      this.setState({ showError: true });
    }, 2000);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < 2) {
      // Try to recover by resetting state
      this.setState({
        hasError: false,
        error: null,
        showError: false,
        retryCount: retryCount + 1
      });
    } else {
      // After 2 retries, do a full page reload
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.showError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Show error UI
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "20px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#ef4444" }}>Something went wrong</h2>
          <p style={{ marginBottom: "1rem", color: "#94a3b8" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: "10px"
            }}
          >
            {this.state.retryCount < 2 ? 'Try Again' : 'Reload Page'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

