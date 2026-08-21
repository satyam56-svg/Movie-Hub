import { useEffect, useState } from 'react'

function Header({ isLoggedIn, onLogout }) {
    const [locationName, setLocationName] = useState('Detecting location...')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationName('Location not supported')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
                    )

                    if (!response.ok) {
                        throw new Error('Failed to get location name')
                    }

                    const data = await response.json()
                    const address = data.address || {}

                    const city =
                        address.city ||
                        address.town ||
                        address.village ||
                        address.county ||
                        'Unknown location'

                    const state = address.state || ''

                    setLocationName(
                        state && state !== city
                            ? `${city}, ${state}`
                            : city
                    )
                } catch (error) {
                    console.error('Error getting location name:', error)

                    setLocationName(
                        `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
                    )
                }
            },
            (error) => {
                console.error('Location error:', error)

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationName('Location denied')
                        break

                    case error.POSITION_UNAVAILABLE:
                        setLocationName('Location unavailable')
                        break

                    case error.TIMEOUT:
                        setLocationName('Location timeout')
                        break

                    default:
                        setLocationName('Location error')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        )
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            detectLocation()
        }, 0)

        return () => clearTimeout(timer)
    }, [])

    const handleRefreshLocation = () => {
        setLocationName('Detecting location...')
        detectLocation()
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <header className="header">
            <div className="container">
                <div className="nav-wrapper">
                    <a
                        href="#home"
                        className="logo"
                        onClick={closeMobileMenu}
                    >
                        <i className="fas fa-film"></i>
                        MovieHub
                    </a>

                    <div className="location-display">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{locationName}</span>

                        <button
                            id="refreshLocation"
                            type="button"
                            title="Refresh location"
                            aria-label="Refresh location"
                            onClick={handleRefreshLocation}
                        >
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>

                    <nav
                        className={`nav-menu ${
                            isMobileMenuOpen ? 'open' : ''
                        }`}
                    >
                        <ul>
                            <li>
                                <a
                                    href="#home"
                                    className="nav-link active"
                                    onClick={closeMobileMenu}
                                >
                                    Home
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#top-movies"
                                    className="nav-link"
                                    onClick={closeMobileMenu}
                                >
                                    Movies
                                </a>
                            </li>

                            {isLoggedIn && (
                                <>
                                    <li>
                                        <a
                                            href="#profile"
                                            className="nav-link"
                                            onClick={closeMobileMenu}
                                        >
                                            Profile
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#favorites"
                                            className="nav-link"
                                            onClick={closeMobileMenu}
                                        >
                                            Favorites
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#watchlist"
                                            className="nav-link"
                                            onClick={closeMobileMenu}
                                        >
                                            Watchlist
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#my-reviews"
                                            className="nav-link"
                                            onClick={closeMobileMenu}
                                        >
                                            My Reviews
                                        </a>
                                    </li>
                                </>
                            )}

                            <li>
                                <a
                                    href="#nearby"
                                    className="nav-link"
                                    onClick={closeMobileMenu}
                                >
                                    Theaters
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {isLoggedIn ? (
                        <div className="user-menu">
                            <span className="username">
                                <i className="fas fa-user-circle"></i>{' '}
                                {localStorage.getItem('username')}
                            </span>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                    closeMobileMenu()
                                    onLogout()
                                }}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                {' '}Logout
                            </button>
                        </div>
                    ) : (
                        <div className="user-menu">
                            <a
                                href="#auth"
                                className="btn-primary"
                                onClick={closeMobileMenu}
                            >
                                <i className="fas fa-user"></i>
                                {' '}Account
                            </a>
                        </div>
                    )}

                    <button
                        type="button"
                        className="mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                    >
                        <i
                            className={
                                isMobileMenuOpen
                                    ? 'fas fa-times'
                                    : 'fas fa-bars'
                            }
                        ></i>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header