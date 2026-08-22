import { useEffect, useState } from 'react'
import MovieCard from './MovieCard'
import MovieModal from './MovieModal'
import SkeletonCard from './SkeletonCard'
import { useDebounce } from '../hooks/useDebounce'
import API_BASE_URL from '../api/config'

function MovieSection({ searchTerm, onSearchChange }) {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [selectedGenre, setSelectedGenre] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    useEffect(() => {
        let isSubscribed = true

        const fetchMovies = async () => {
            setLoading(true)
            setError('')

            try {
                const params = new URLSearchParams()

                if (debouncedSearchTerm.trim()) {
                    params.append('search', debouncedSearchTerm.trim())
                }

                if (selectedGenre) {
                    params.append('genre', selectedGenre)
                }

                params.append('page', page)
                params.append('size', 10)

                const token = localStorage.getItem('token')

                const response = await fetch(
                    `${API_BASE_URL}/api/movies?${params.toString()}`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load movies')
                }

                const data = await response.json()

                if (isSubscribed) {
                    setMovies(data.content || [])
                    setTotalPages(data.totalPages || 0)
                }
            } catch (err) {
                if (isSubscribed) {
                    console.error('Movie API error:', err)
                    setError('Unable to load movies right now. Please try again.')
                    setMovies([])
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false)
                }
            }
        }

        fetchMovies()

        return () => {
            isSubscribed = false
        }
    }, [debouncedSearchTerm, selectedGenre, page])

    const handleSearchChange = (e) => {
        onSearchChange(e.target.value)
        setPage(0)
    }

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value)
        setPage(0)
    }

    const handleClearFilters = () => {
        onSearchChange('')
        setSelectedGenre('')
        setPage(0)
    }

    return (
        <section id="top-movies" className="section">
            <div className="container">
                <h2 className="section-title">
                    Top Movies
                </h2>

                <div className="movie-filters">
                    <input
                        type="text"
                        placeholder="Search movies by title or director..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />

                    <select
                        value={selectedGenre}
                        onChange={handleGenreChange}
                    >
                        <option value="">All Genres</option>
                        <option value="Drama">Drama</option>
                        <option value="Action">Action</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Romance">Romance</option>
                        <option value="Horror">Horror</option>
                        <option value="Animation">Animation</option>
                    </select>

                    {(searchTerm || selectedGenre) && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleClearFilters}
                            style={{ height: '44px', whiteSpace: 'nowrap' }}
                        >
                            <i className="fas fa-times"></i> Clear Filters
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="movies-grid">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <SkeletonCard key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="loading" style={{ borderStyle: 'solid' }}>
                        <i className="fas fa-exclamation-circle" style={{ color: 'var(--accent-red)' }}></i>
                        <span>{error}</span>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPage(0)}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Retry
                        </button>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="loading" style={{ borderStyle: 'solid' }}>
                        <i className="fas fa-film" style={{ opacity: 0.5 }}></i>
                        <span>No movies found matching your search criteria.</span>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleClearFilters}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="movies-grid">
                            {movies.map((movie, index) => (
                                <MovieCard
                                    key={`${movie.id || movie.title}-${index}`}
                                    movie={movie}
                                    onMovieClick={setSelectedMovie}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn-secondary"
                                    disabled={page === 0}
                                    onClick={() => setPage((prev) => prev - 1)}
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page + 1} of {totalPages}
                                </span>

                                <button
                                    className="btn-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((prev) => prev + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            </div>
        </section>
    )
}

export default MovieSection