import { useEffect, useState } from 'react'
import MovieCard from './MovieCard'
import MovieModal from './MovieModal'
import API_BASE_URL from '../api/config'

function MovieSection({ searchTerm, onSearchChange }) {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [selectedGenre, setSelectedGenre] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true)
            setError('')

            try {
                const params = new URLSearchParams()

                if (searchTerm.trim()) {
                    params.append('search', searchTerm.trim())
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
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load movies')
                }

                const data = await response.json()

                setMovies(data.content || [])
                setTotalPages(data.totalPages || 0)
            } catch (err) {
                console.error('Movie API error:', err)
                setError('Unable to load movies')
                setMovies([])
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [searchTerm, selectedGenre, page])

    const handleSearchChange = (e) => {
        onSearchChange(e.target.value)
        setPage(0)
    }

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value)
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
                        placeholder="Search movies..."
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
                </div>

                {loading && (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading movies...</span>
                    </div>
                )}

                {error && (
                    <div className="loading">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="movies-grid">
                            {movies.length === 0 ? (
                                <div className="loading">
                                    No movies found
                                </div>
                            ) : (
                                movies.map((movie, index) => (
                                    <MovieCard
                                        key={`${movie.id || movie.title}-${index}`}
                                        movie={movie}
                                        onMovieClick={setSelectedMovie}
                                    />
                                ))
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn-secondary"
                                    disabled={page === 0}
                                    onClick={() =>
                                        setPage((prev) => prev - 1)
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page + 1} of {totalPages}
                                </span>

                                <button
                                    className="btn-secondary"
                                    disabled={
                                        page >= totalPages - 1
                                    }
                                    onClick={() =>
                                        setPage((prev) => prev + 1)
                                    }
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