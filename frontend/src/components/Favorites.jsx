import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'
import { authFetch } from '../api/authFetch'

function FavoriteMovieCard({ favorite, onRemove }) {
    const [imgError, setImgError] = useState(false)
    const movie = favorite.movie

    if (!movie) {
        return null
    }

    const hasPoster =
        movie.posterUrl &&
        movie.posterUrl.trim() !== '' &&
        !imgError

    return (
        <div className="movie-card">
            <div className="movie-poster">
                {hasPoster ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title || 'Movie Poster'}
                        onError={() => setImgError(true)}
                        loading="lazy"
                        decoding="async"
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
                    className="btn-danger favorite-remove-btn"
                    onClick={() => onRemove(movie.id)}
                >
                    <i className="fas fa-trash-alt"></i>
                    <span>Remove</span>
                </button>
            </div>
        </div>
    )
}

function Favorites() {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadFavorites = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('Please login to view your favorites.')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')

                const response = await authFetch(
                    `${API_BASE_URL}/api/favorites`
                )

                if (!response.ok) {
                    throw new Error('Failed to load favorites')
                }

                const data = await response.json()

                setFavorites(data || [])
            } catch (error) {
                console.error('Favorites API error:', error)
                setError('Unable to load favorites.')
            } finally {
                setLoading(false)
            }
        }

        loadFavorites()
    }, [])

    const handleRemove = async (movieId) => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        try {
            const response = await authFetch(
                `${API_BASE_URL}/api/favorites/${movieId}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                throw new Error('Failed to remove favorite')
            }

            setFavorites((prev) =>
                prev.filter(
                    (favorite) =>
                        favorite.movie?.id !== movieId
                )
            )
        } catch (error) {
            console.error('Remove favorite error:', error)
            setError('Unable to remove favorite.')
        }
    }

    if (loading) {
        return (
            <section id="favorites" className="section">
                <div className="container">
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading favorites...</span>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section id="favorites" className="section">
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
        <section id="favorites" className="section">
            <div className="container">
                <h2 className="section-title">My Favorites</h2>

                {favorites.length === 0 ? (
                    <div className="loading">
                        <i className="fas fa-heart-broken state-icon-muted"></i>
                        <span>No favorite movies added yet.</span>
                    </div>
                ) : (
                    <div className="movies-grid">
                        {favorites.map((favorite) => (
                            <FavoriteMovieCard
                                key={favorite.id}
                                favorite={favorite}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Favorites