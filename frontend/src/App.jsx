import { useEffect, useState } from 'react'
import './App.css'

import Login from './components/Login'
import Register from './components/Register'
import Header from './components/Header'
import Hero from './components/Hero'
import MovieSection from './components/MovieSection'
import NearbyTheaters from './components/NearbyTheaters'
import Profile from './components/Profile'
import Favorites from './components/Favorites'
import Watchlist from './components/Watchlist'
import MyReviews from './components/MyReviews'
import AdminDashboard from './components/AdminDashboard'

function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('token')
    )
    const [showRegister, setShowRegister] = useState(false)


    const handleSearch = (term) => {
        setSearchTerm(term)

        document
            .getElementById('top-movies')
            ?.scrollIntoView({
                behavior: 'smooth',
            })
    }

    const handleLoginSuccess = () => {
        setIsLoggedIn(true)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')

        setIsLoggedIn(false)
    }

    // Auto-logout when authFetch detects a stale token (401/403 from backend)
    useEffect(() => {
        const onSessionExpired = () => {
            setIsLoggedIn(false)
        }
        window.addEventListener('session-expired', onSessionExpired)
        return () =>
            window.removeEventListener('session-expired', onSessionExpired)
    }, [])

    return (
        <div className="app-container">
            <Header
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
            />

            <Hero onSearch={handleSearch} />

            {!isLoggedIn && (
                <section id="auth" className="section bg-dark">
                    <div className="container">
                        {showRegister ? (
                            <Register />
                        ) : (
                            <Login onLoginSuccess={handleLoginSuccess} />
                        )}

                        <div className="auth-switch">
                            {showRegister ? (
                                <>
                                    <span>Already have an account?</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowRegister(false)}
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>Don't have an account?</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowRegister(true)}
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <MovieSection
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            {isLoggedIn && <Profile />}
            {isLoggedIn && <MyReviews />}
            {isLoggedIn && <Favorites />}
            {isLoggedIn && <Watchlist />}
            {isLoggedIn && localStorage.getItem('role') === 'ADMIN' && (
                <AdminDashboard />
            )}
            <NearbyTheaters />
        </div>
    )
}

export default App