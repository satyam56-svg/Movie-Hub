import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'
import { authFetch } from '../api/authFetch'

function WatchlistMovieCard({ item, onRemove }) {
    const [imgError, setImgError] = useState(false)
    const movie = item.movie

    if (!movie) {
        return null
    }

    const hasPoster = movie.posterUrl && movie.posterUrl.trim() !== '' && !imgError

    return (
        <div className="movie-card" key={item.id}>
            <div className="movie-poster">
                {hasPoster ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title || 'Movie Poster'}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="movie-poster-placeholder">
                        <i className="fas fa-film"></i>
                        <span>{movie.title || 'No Poster'}</span>
                    </div>
                )}
            </div>

            <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>

                {movie.releaseYear && (
                    <div className="movie-year">{movie.releaseYear}</div>
                )}

                <button
                    type="button"
                    className="btn-danger"
                    style={{ marginTop: '0.75rem' }}
                    onClick={() => onRemove(movie.id)}
                >
                    <i className="fas fa-trash-alt"></i> Remove
                </button>
            </div>
        </div>
    )
}

function Watchlist() {
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchWatchlist = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please login to view your watchlist.')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await authFetch(
                `${API_BASE_URL}/api/watchlist`
            )

            if (!response.ok) {
                throw new Error('Failed to load watchlist')
            }

            const data = await response.json()

            setWatchlist(data || [])
        } catch (error) {
            console.error('Watchlist API error:', error)
            setError('Unable to load watchlist.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWatchlist()
        }, 0)

        return () => clearTimeout(timer)
    }, [])

    const handleRemove = async (movieId) => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        try {
            const response = await authFetch(
                `${API_BASE_URL}/api/watchlist/${movieId}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                throw new Error('Failed to remove movie')
            }

            setWatchlist((prev) =>
                prev.filter(
                    (item) => item.movie?.id !== movieId
                )
            )
        } catch (error) {
            console.error('Remove watchlist error:', error)
            setError('Unable to remove movie from watchlist.')
        }
    }

    if (loading) {
        return (
            <section id="watchlist" className="section bg-dark">
                <div className="container">
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading watchlist...</span>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section id="watchlist" className="section bg-dark">
                <div className="container">
                    <div className="loading">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="watchlist" className="section bg-dark">
            <div className="container">
                <h2 className="section-title">My Watchlist</h2>

                {watchlist.length === 0 ? (
                    <div className="loading">
                        <i className="fas fa-bookmark state-icon-muted"></i>
                        <span>No movies in your watchlist yet.</span>
                    </div>
                ) : (
                    <div className="movies-grid">
                        {watchlist.map((item) => (
                            <WatchlistMovieCard
                                key={item.id}
                                item={item}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Watchlist