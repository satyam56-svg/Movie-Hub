import { useState } from 'react'
import API_BASE_URL from '../api/config'

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : 'Invalid email or password'
                )
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('username', data.username)
            localStorage.setItem('role', data.role)

            console.log('Login successful:', data)
            onLoginSuccess()

        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-card">
            <h2>Welcome Back</h2>

            <p className="auth-subtitle">
                Sign in to your MovieHub account
            </p>

            {error && (
                <div className="auth-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="login-email">
                        <i className="fas fa-envelope"></i> Email Address
                    </label>

                    <input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="login-password">
                        <i className="fas fa-lock"></i> Password
                    </label>

                    <input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary auth-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Logging in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>
        </div>
    )
}

export default Login