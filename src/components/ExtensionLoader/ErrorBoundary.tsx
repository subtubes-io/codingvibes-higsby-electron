/**
 * ErrorBoundary Component
 * Catches and handles errors from extension components
 */

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    extensionId: string;
    extensionName: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`Extension error in ${this.props.extensionId}:`, error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You could also report this error to an error reporting service here
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="extension-error-boundary">
                    <div className="error-boundary-content">
                        <div className="error-icon">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                        </div>

                        <h3>Extension Error</h3>
                        <p>
                            The extension "<strong>{this.props.extensionName}</strong>" encountered an error
                            and could not be rendered properly.
                        </p>

                        <div className="error-actions">
                            <button
                                className="retry-btn"
                                onClick={this.handleReset}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                                </svg>
                                Try Again
                            </button>

                            <button
                                className="reload-btn"
                                onClick={() => window.location.reload()}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                                </svg>
                                Reload Page
                            </button>
                        </div>

                        <details className="error-details">
                            <summary>Technical Details</summary>
                            <div className="error-info">
                                <div className="error-section">
                                    <h4>Extension ID:</h4>
                                    <code>{this.props.extensionId}</code>
                                </div>

                                {this.state.error && (
                                    <div className="error-section">
                                        <h4>Error Message:</h4>
                                        <pre className="error-message">{this.state.error.message}</pre>
                                    </div>
                                )}

                                {this.state.error?.stack && (
                                    <div className="error-section">
                                        <h4>Stack Trace:</h4>
                                        <pre className="error-stack">{this.state.error.stack}</pre>
                                    </div>
                                )}

                                {this.state.errorInfo?.componentStack && (
                                    <div className="error-section">
                                        <h4>Component Stack:</h4>
                                        <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
