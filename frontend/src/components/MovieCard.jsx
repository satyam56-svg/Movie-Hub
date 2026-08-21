import { useState } from 'react'

function MovieCard({ movie, onMovieClick }) {
    const [imgError, setImgError] = useState(false)

    const hasPoster = movie?.posterUrl && movie.posterUrl.trim() !== '' && !imgError

    const openMovie = () => onMovieClick?.(movie)

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openMovie()
        }
    }

    return (
        <article
            className="movie-card"
            onClick={openMovie}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${movie.title || 'movie'}`}
        >
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
                <h3 className="movie-title">
                    {movie.title}
                </h3>

                {movie.releaseYear && (
                    <div className="movie-year">
                        {movie.releaseYear}
                    </div>
                )}

                {movie.imdbRating != null && (
                    <div className="movie-rating">
                        <span className="rating-stars">★</span>
                        <span className="rating-value">{movie.imdbRating} IMDb</span>
                    </div>
                )}

                {movie.userRating != null && movie.userRating > 0 && (
                    <div className="movie-rating movie-rating-user">
                        <span className="rating-stars">⭐</span>
                        <span className="rating-value">{movie.userRating}/5 User</span>
                    </div>
                )}
            </div>
        </article>
    )
}

export default MovieCard