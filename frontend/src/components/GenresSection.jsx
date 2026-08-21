import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'

function GenresSection() {
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const token = localStorage.getItem('token')

                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {}

                const response = await fetch(
                    `${API_BASE_URL}/api/movies?page=0&size=200`,
                    { headers }
                )

                if (!response.ok) {
                    throw new Error('Failed to load movie data')
                }

                const data = await response.json()
                const movies = data.content || []

                const genreMap = new Map()

                movies.forEach((movie) => {
                    const genreStr = movie.genre || ''

                    if (!genreStr.trim()) {
                        return
                    }

                    const movieGenres = genreStr
                        .split(',')
                        .map((genre) => genre.trim())
                        .filter(Boolean)

                    movieGenres.forEach((genre) => {
                        if (genreMap.has(genre)) {
                            genreMap.set(genre, genreMap.get(genre) + 1)
                        } else {
                            genreMap.set(genre, 1)
                        }
                    })
                })

                const genreList = Array.from(
                    genreMap,
                    ([name, count]) => ({ name, count })
                )

                genreList.sort((a, b) => b.count - a.count)

                setGenres(genreList)
                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Unable to load genres')
                setLoading(false)
            }
        }

        fetchGenres()
    }, [])

    return (
        <section id="genres" className="section">
            <div className="container">
                <h2 className="section-title">Explore Genres</h2>

                {loading && (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading movie genres...</span>
                    </div>
                )}

                {error && (
                    <div className="loading">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="genres-grid">
                        {genres.map((genre) => (
                            <div
                                className="genre-card"
                                key={genre.name}
                            >
                                <i className="fas fa-tags"></i>
                                <h3>{genre.name}</h3>
                                <span>{genre.count} {genre.count === 1 ? 'movie' : 'movies'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default GenresSection