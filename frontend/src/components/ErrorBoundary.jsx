import { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                        <div className="loading" style={{ borderStyle: 'solid', borderColor: 'var(--border-subtle)' }}>
                            <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--accent-red)' }}></i>
                            <h2>Something went wrong</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                An unexpected error occurred while displaying this page.
                            </p>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={this.handleReset}
                                style={{ marginTop: '1rem' }}
                            >
                                <i className="fas fa-redo"></i> Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
