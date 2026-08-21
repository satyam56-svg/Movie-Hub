import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'

function ActorCard({ actor }) {
    return (
        <div className="actor-card" key={actor.name}>
            <div className="actor-photo">
                <i className="fas fa-user-tie"></i>
            </div>

            <div className="actor-name">{actor.name}</div>

            {actor.movies && actor.movies.length > 0 && (
                <div className="actor-movies">
                    {actor.movies.slice(0, 3).join(', ')}
                </div>
            )}
        </div>
    )
}

function ActorsSection() {
    const [actors, setActors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchActors = async () => {
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

                const actorMap = new Map()

                movies.forEach((movie) => {
                    const castStr = movie.cast || ''

                    if (!castStr.trim()) {
                        return
                    }

                    const castNames = castStr
                        .split(',')
                        .map((name) => name.trim())
                        .filter(Boolean)

                    castNames.forEach((name) => {
                        if (actorMap.has(name)) {
                            const existing = actorMap.get(name)
                            if (!existing.movies.includes(movie.title)) {
                                existing.movies.push(movie.title)
                            }
                        } else {
                            actorMap.set(name, {
                                name,
                                movies: movie.title ? [movie.title] : [],
                            })
                        }
                    })
                })

                setActors(Array.from(actorMap.values()))
                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Unable to load actors')
                setLoading(false)
            }
        }

        fetchActors()
    }, [])

    return (
        <section id="actors" className="section bg-dark">
            <div className="container">
                <h2 className="section-title">Popular Actors</h2>

                {loading && (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading featured actors...</span>
                    </div>
                )}

                {error && (
                    <div className="loading">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="actors-grid">
                        {actors.map((actor) => (
                            <ActorCard key={actor.name} actor={actor} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default ActorsSection