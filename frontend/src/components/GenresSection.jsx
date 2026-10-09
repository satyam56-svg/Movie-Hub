import { useState, useEffect, useCallback } from 'react'
import MovieCard from './MovieCard'
import MovieModal from './MovieModal'
import SkeletonCard from './SkeletonCard'
import API_BASE_URL from '../api/config'

// Curated genre list with icons matching the screenshot style
const GENRE_LIST = [
    { name: 'Action',         icon: 'fa-fist-raised'    },
    { name: 'Adventure',      icon: 'fa-compass'        },
    { name: 'Animation',      icon: 'fa-magic'          },
    { name: 'Comedy',         icon: 'fa-smile'          },
    { name: 'Crime',          icon: 'fa-user-secret'    },
    { name: 'Drama',          icon: 'fa-theater-masks'  },
    { name: 'Fantasy',        icon: 'fa-dragon'         },
    { name: 'Horror',         icon: 'fa-ghost'          },
    { name: 'Mystery',        icon: 'fa-search'         },
    { name: 'Romance',        icon: 'fa-heart'          },
    { name: 'Sci-Fi',         icon: 'fa-rocket'         },
    { name: 'Thriller',       icon: 'fa-bolt'           },
]

function GenresSection({ onGenreSelect }) {
    const [activeGenre, setActiveGenre]       = useState(null)
    const [movies, setMovies]                 = useState([])
    const [loadingMovies, setLoadingMovies]   = useState(false)
    const [moviesError, setMoviesError]       = useState('')
    const [selectedMovie, setSelectedMovie]   = useState(null)

    // Fetch movies for the chosen genre via the existing backend endpoint
    const fetchMoviesByGenre = useCallback(async (genre) => {
        setLoadingMovies(true)
        setMoviesError('')
        setMovies([])

        try {
            const token = localStorage.getItem('token')
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            // Use the same genre query param already supported by MovieSection
            const params = new URLSearchParams({ genre, page: 0, size: 20 })
            const response = await fetch(
                `${API_BASE_URL}/api/movies?${params}`,
                { headers }
            )

            if (!response.ok) throw new Error('Failed to load movies')

            const data = await response.json()
            setMovies(data.content || [])
        } catch (err) {
            console.error('Genre movies fetch error:', err)
            setMoviesError('Unable to load movies for this genre. Please try again.')
        } finally {
            setLoadingMovies(false)
        }
    }, [])

    const handleGenreClick = (genre) => {
        if (activeGenre === genre.name) return        // already selected
        setActiveGenre(genre.name)
        if (onGenreSelect) onGenreSelect(genre.name)  // lift state if needed
        fetchMoviesByGenre(genre.name)

        // Smooth-scroll to the results area below the genre cards
        setTimeout(() => {
            document.getElementById('genre-results')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }, 100)
    }

    const handleClearGenre = () => {
        setActiveGenre(null)
        setMovies([])
        setMoviesError('')
        if (onGenreSelect) onGenreSelect('')
    }

    return (
        <section id="genres" className="section bg-dark genres-section-wrapper">
            <div className="container">
                {/* ── Section heading ── */}
                <div className="genres-section-header">
                    <h2 className="section-title">
                        <i className="fas fa-layer-group genres-heading-icon" />
                        Browse by Genre
                    </h2>
                    {activeGenre && (
                        <button
                            type="button"
                            className="btn-secondary genres-clear-btn"
                            onClick={handleClearGenre}
                        >
                            <i className="fas fa-times" /> All Genres
                        </button>
                    )}
                </div>

                {/* ── Genre card grid ── */}
                <div className="genres-grid-styled">
                    {GENRE_LIST.map((genre) => {
                        const isActive = activeGenre === genre.name
                        return (
                            <button
                                key={genre.name}
                                type="button"
                                id={`genre-btn-${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`genre-card-styled${isActive ? ' genre-card-active' : ''}`}
                                onClick={() => handleGenreClick(genre)}
                                aria-pressed={isActive}
                                aria-label={`Browse ${genre.name} movies`}
                            >
                                <i className={`fas ${genre.icon} genre-card-icon`} />
                                <span className="genre-card-label">{genre.name}</span>
                                {isActive && (
                                    <span className="genre-active-dot" aria-hidden="true" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* ── Movie results for selected genre ── */}
                {activeGenre && (
                    <div id="genre-results" className="genre-results-section">
                        <div className="genre-results-header">
                            <h3 className="genre-results-title">
                                <i className="fas fa-film" />
                                {activeGenre} Movies
                            </h3>
                            <span className="genre-results-count">
                                {!loadingMovies && !moviesError &&
                                    `${movies.length} found`}
                            </span>
                        </div>

                        {loadingMovies && (
                            <div className="movies-grid">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <SkeletonCard key={`gskel-${i}`} />
                                ))}
                            </div>
                        )}

                        {moviesError && (
                            <div className="loading" style={{ borderStyle: 'solid' }}>
                                <i className="fas fa-exclamation-circle" style={{ color: 'var(--accent-red)' }} />
                                <span>{moviesError}</span>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => fetchMoviesByGenre(activeGenre)}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loadingMovies && !moviesError && movies.length === 0 && (
                            <div className="loading" style={{ borderStyle: 'solid' }}>
                                <i className="fas fa-film" style={{ opacity: 0.4 }} />
                                <span>No movies found for <strong>{activeGenre}</strong>.</span>
                            </div>
                        )}

                        {!loadingMovies && !moviesError && movies.length > 0 && (
                            <div className="movies-grid">
                                {movies.map((movie, index) => (
                                    <MovieCard
                                        key={`${movie.id || movie.title}-${index}`}
                                        movie={movie}
                                        onMovieClick={setSelectedMovie}
                                    />
                                ))}
                            </div>
                        )}

                        <MovieModal
                            movie={selectedMovie}
                            onClose={() => setSelectedMovie(null)}
                        />
                    </div>
                )}
            </div>
        </section>
    )
}

export default GenresSection