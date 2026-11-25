import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onReload?: () => void;
  onNavigateHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught rendering error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReload) {
      this.props.onReload();
    } else {
      window.location.reload();
    }
  };

  handleNavigateHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.assign('/dashboard');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container} role="alert">
          <div className={styles.card}>
            <AlertTriangle size={36} color="#ef4444" />
            <h2 className={styles.title}>Something went wrong on your desk</h2>
            <p className={styles.subtitle}>
              An unexpected render issue occurred. Your saved notes are completely safe.
            </p>
            {this.state.errorMessage && (
              <p className={styles.errorDetail}>{this.state.errorMessage}</p>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.reloadBtn}
                onClick={this.handleReload}
              >
                <RotateCcw size={15} />
                <span>Reload Workspace</span>
              </button>
              <button
                type="button"
                className={styles.homeBtn}
                onClick={this.handleNavigateHome}
              >
                <Home size={15} />
                <span>Return to Desk</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
