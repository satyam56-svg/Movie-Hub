import { useEffect, useState } from 'react'
import Reviews from './Reviews'
import API_BASE_URL from '../api/config'
import { authFetch } from '../api/authFetch'

function MoviePoster({ movie }) {
    const [imgError, setImgError] = useState(false)

    const hasPoster =
        movie.posterUrl &&
        movie.posterUrl.trim() !== '' &&
        !imgError

    if (!hasPoster) {
        return (
            <div className="movie-detail-poster movie-poster-placeholder">
                <i className="fas fa-film"></i>
                <span>{movie.title || 'No Poster Available'}</span>
            </div>
        )
    }

    return (
        <img
            className="movie-detail-poster"
            src={movie.posterUrl}
            alt={movie.title || 'Movie Poster'}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
        />
    )
}

function MovieModal({ movie, onClose }) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteLoading, setFavoriteLoading] = useState(false)
    const [favoriteError, setFavoriteError] = useState('')
    const [isWatchlist, setIsWatchlist] = useState(false)
    const [watchlistLoading, setWatchlistLoading] = useState(false)
    const [watchlistError, setWatchlistError] = useState('')

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        const checkMovieStatus = async () => {
            if (!movie?.id) {
                return
            }

            const token = localStorage.getItem('token')

            if (!token) {
                setIsFavorite(false)
                setIsWatchlist(false)
                return
            }

            try {
                setFavoriteError('')
                setWatchlistError('')

                const [favoriteResponse, watchlistResponse] =
                    await Promise.all([
                        authFetch(
                            `${API_BASE_URL}/api/favorites/${movie.id}/check`
                        ),
                        authFetch(
                            `${API_BASE_URL}/api/watchlist/${movie.id}/check`
                        ),
                    ])

                if (favoriteResponse.ok) {
                    const favoriteData = await favoriteResponse.json()
                    setIsFavorite(favoriteData)
                }

                if (watchlistResponse.ok) {
                    const watchlistData = await watchlistResponse.json()
                    setIsWatchlist(watchlistData)
                }
            } catch (error) {
                console.error('Movie status check error:', error)
            }
        }

        checkMovieStatus()
    }, [movie])

    const handleFavoriteToggle = async () => {
        if (!movie?.id) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setFavoriteError('Please login to manage favorites.')
            return
        }

        try {
            setFavoriteLoading(true)
            setFavoriteError('')

            const response = await authFetch(
                `${API_BASE_URL}/api/favorites/${movie.id}`,
                { method: isFavorite ? 'DELETE' : 'POST' }
            )

            if (!response.ok) {
                throw new Error(
                    isFavorite
                        ? 'Failed to remove favorite'
                        : 'Failed to add favorite'
                )
            }

            setIsFavorite((prev) => !prev)
        } catch (error) {
            console.error('Favorite toggle error:', error)

            setFavoriteError(
                isFavorite
                    ? 'Unable to remove favorite.'
                    : 'Unable to add favorite.'
            )
        } finally {
            setFavoriteLoading(false)
        }
    }

    const handleWatchlistToggle = async () => {
        if (!movie?.id) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setWatchlistError('Please login to manage your watchlist.')
            return
        }

        try {
            setWatchlistLoading(true)
            setWatchlistError('')

            const response = await authFetch(
                `${API_BASE_URL}/api/watchlist/${movie.id}`,
                { method: isWatchlist ? 'DELETE' : 'POST' }
            )

            if (!response.ok) {
                throw new Error(
                    isWatchlist
                        ? 'Failed to remove from watchlist'
                        : 'Failed to add to watchlist'
                )
            }

            setIsWatchlist((prev) => !prev)
        } catch (error) {
            console.error('Watchlist toggle error:', error)

            setWatchlistError(
                isWatchlist
                    ? 'Unable to remove from watchlist.'
                    : 'Unable to add to watchlist.'
            )
        } finally {
            setWatchlistLoading(false)
        }
    }

    if (!movie) {
        return null
    }

    return (
        <div
            className="modal"
            style={{ display: 'flex' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div className="modal-content">
                <button
                    className="close"
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    &times;
                </button>

                <div className="movie-detail-header">
                    <MoviePoster key={movie.id} movie={movie} />

                    <div className="movie-detail-info">
                        <h2>{movie.title}</h2>

                        <div className="movie-detail-meta">
                            <span className="meta-item">
                                <i className="fas fa-calendar"></i>{' '}
                                {movie.releaseYear ?? 'Not Available'}
                            </span>
                            <span className="meta-item">
                                <i className="fas fa-clock"></i>{' '}
                                {movie.runtime || 'Not Available'}
                            </span>
                            <span className="meta-item">
                                <i className="fas fa-tag"></i>{' '}
                                {movie.genre || 'Not Available'}
                            </span>
                            <span className="meta-item">
                                <i className="fas fa-user-tie"></i>{' '}
                                Director: {movie.director || 'Not Available'}
                            </span>
                        </div>

                        {movie.cast ? (
                            <p
                                className="movie-detail-description"
                                style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}
                            >
                                <strong>Cast:</strong>{' '}
                                {movie.cast
                                    .split(',')
                                    .map(actor => actor.trim())
                                    .filter(Boolean)
                                    .map((actor, index, actors) => (
                                        <span key={`${actor}-${index}`}>
                                            <a
                                                href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(actor)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: 'var(--accent-gold)',
                                                    textDecoration: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.textDecoration = 'underline';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.textDecoration = 'none';
                                                }}
                                            >
                                                {actor}
                                            </a>
                                            {index < actors.length - 1 && ', '}
                                        </span>
                                    ))}
                            </p>
                        ) : (
                            <p
                                className="movie-detail-description"
                                style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}
                            >
                                <strong>Cast:</strong> Not Available
                            </p>
                        )}

                        {movie.description && (
                            <p className="movie-detail-description">
                                {movie.description}
                            </p>
                        )}

                        {/* Ratings Section */}
                        <div className="ratings-comparison">
                            <h3>Ratings Breakdown</h3>
                            <div className="ratings-grid">
                                {movie.imdbRating != null && (
                                    <div className="rating-source">
                                        <span>IMDb Score</span>
                                        <strong>★ {movie.imdbRating}</strong>
                                    </div>
                                )}

                                {movie.tomatometer != null && (
                                    <div className="rating-source">
                                        <span>Tomatometer</span>
                                        <strong style={{ color: 'var(--accent-red)' }}>
                                            🍅 {movie.tomatometer}
                                        </strong>
                                    </div>
                                )}

                                {movie.popcornmeter != null && (
                                    <div className="rating-source">
                                        <span>Popcornmeter</span>
                                        <strong>🍿 {movie.popcornmeter}</strong>
                                    </div>
                                )}

                                {movie.metacriticScore != null && (
                                    <div className="rating-source">
                                        <span>Metacritic</span>
                                        <strong style={{ color: 'var(--accent-blue)' }}>
                                            {movie.metacriticScore}/100
                                        </strong>
                                    </div>
                                )}

                                {movie.metacriticUserScore != null && (
                                    <div className="rating-source">
                                        <span>Metacritic User</span>
                                        <strong>{movie.metacriticUserScore}</strong>
                                    </div>
                                )}

                                {movie.userRating != null && movie.userRating > 0 && (
                                    <div className="rating-source">
                                        <span>MovieHub User</span>
                                        <strong>⭐ {movie.userRating}/5</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons & External Source Links */}
                        <div className="movie-actions">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleFavoriteToggle}
                                disabled={favoriteLoading}
                            >
                                <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                                {favoriteLoading
                                    ? 'Updating...'
                                    : isFavorite
                                        ? 'Remove Favorites'
                                        : 'Add to Favorites'}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleWatchlistToggle}
                                disabled={watchlistLoading}
                            >
                                <i className={isWatchlist ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                                {watchlistLoading
                                    ? 'Updating...'
                                    : isWatchlist
                                        ? 'Remove Watchlist'
                                        : 'Add to Watchlist'}
                            </button>

                            {/* External Links */}
                            {movie.rtUrl && (
                                <a
                                    href={movie.rtUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ext-link-btn rt"
                                >
                                    <i className="fas fa-external-link-alt"></i> Rotten Tomatoes
                                </a>
                            )}

                            {movie.metacriticUrl && (
                                <a
                                    href={movie.metacriticUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ext-link-btn metacritic"
                                >
                                    <i className="fas fa-external-link-alt"></i> Metacritic
                                </a>
                            )}
                        </div>

                        {watchlistError && (
                            <div className="auth-error" style={{ marginBottom: '1rem' }}>
                                {watchlistError}
                            </div>
                        )}

                        {favoriteError && (
                            <div className="auth-error" style={{ marginBottom: '1rem' }}>
                                {favoriteError}
                            </div>
                        )}

                        <Reviews movieId={movie.id} />
                    </div>
                </div>
            </div>
        </div>
        // </div>
    )
}

export default MovieModal