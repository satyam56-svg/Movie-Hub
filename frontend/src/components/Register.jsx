import { useState } from 'react'
import API_BASE_URL from '../api/config'

function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        setMessage('')
        setError('')

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                }
            )

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : 'Registration failed'
                )
            }

            setMessage(
                `Registration successful for ${data || 'user'}. You can now login.`
            )

            setUsername('')
            setEmail('')
            setPassword('')
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-card">
            <h2>Create Account</h2>

            <p className="auth-subtitle">
                Join MovieHub today to rate and collect movies
            </p>

            {error && (
                <div className="auth-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            {message && (
                <div className="auth-success">
                    <i className="fas fa-check-circle"></i> {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="register-username">
                        <i className="fas fa-user"></i> Username
                    </label>

                    <input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                        maxLength={50}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="register-email">
                        <i className="fas fa-envelope"></i> Email Address
                    </label>

                    <input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={100}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="register-password">
                        <i className="fas fa-lock"></i> Password
                    </label>

                    <input
                        id="register-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        maxLength={100}
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
                            <i className="fas fa-spinner fa-spin"></i> Creating account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>
        </div>
    )
}

export default Register