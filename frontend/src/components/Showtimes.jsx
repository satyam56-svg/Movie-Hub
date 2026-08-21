import { useMemo, useState } from 'react'

const MOVIES = [
    {
        title: 'The Shawshank Redemption',
        duration: '142 min',
        rating: '9.3',
    },
    {
        title: 'The Godfather',
        duration: '175 min',
        rating: '9.2',
    },
    {
        title: 'The Dark Knight',
        duration: '152 min',
        rating: '9.0',
    },
    {
        title: 'Inception',
        duration: '148 min',
        rating: '8.8',
    },
    {
        title: 'Interstellar',
        duration: '169 min',
        rating: '8.6',
    },
    {
        title: 'Pulp Fiction',
        duration: '154 min',
        rating: '8.9',
    },
]

const THEATERS = [
    'PVR Cinemas',
    'INOX Movies',
    'Cinepolis',
    'Carnival Cinemas',
]

const BASE_TIMES = [
    '10:00',
    '11:30',
    '13:00',
    '14:30',
    '16:00',
    '17:30',
    '19:00',
    '20:30',
    '22:00',
]

function getRandomSubset(array, count) {
    const shuffled = [...array].sort(
        () => 0.5 - Math.random()
    )

    return shuffled.slice(
        0,
        Math.min(count, array.length)
    )
}

function generateShowtimes() {
    const selectedCount =
        4 + Math.floor(Math.random() * 4)

    return getRandomSubset(
        BASE_TIMES,
        selectedCount
    ).sort()
}

function createShowtimesData() {
    const showtimes = {}

    THEATERS.forEach((theater) => {
        showtimes[theater] = {}

        const today = new Date()
        const tomorrow = new Date(today)

        tomorrow.setDate(tomorrow.getDate() + 1)

        ;[today, tomorrow].forEach((date, dateIndex) => {
            const dateStr = date.toISOString().split('T')[0]
            const dayLabel =
                dateIndex === 0 ? 'Today' : 'Tomorrow'

            const selectedMovies = getRandomSubset(
                MOVIES,
                3 + Math.floor(Math.random() * 2)
            )

            showtimes[theater][dateStr] = {
                date: dateStr,
                dayLabel,
                movies: {},
            }

            selectedMovies.forEach((movie) => {
                showtimes[theater][dateStr].movies[
                    movie.title
                    ] = {
                    ...movie,
                    showtimes: generateShowtimes(),
                    availableScreens:
                        ['Screen 1', 'Screen 2'][
                            Math.floor(Math.random() * 2)
                            ],
                }
            })
        })
    })

    return showtimes
}

function Showtimes({ theaterName, onClose }) {
    const [selectedShowtime, setSelectedShowtime] =
        useState(null)

    const showtimesData = useMemo(
        () => createShowtimesData(),
        []
    )

    const theaterData = showtimesData[theaterName]

    if (!theaterData) {
        return (
            <div className="showtimes-container">
                <div className="showtimes-header">
                    <h2>{theaterName}</h2>

                    <p>
                        No showtimes available for this
                        theater.
                    </p>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    if (selectedShowtime) {
        return (
            <div className="showtimes-container">
                <div
                    style={{
                        textAlign: 'center',
                        padding: '1rem 0',
                    }}
                >
                    <h2
                        style={{
                            color: 'var(--accent-gold)',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <i className="fas fa-ticket-alt"></i>{' '}
                        Booking Details
                    </h2>

                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                        }}
                    >
                        Review your showtime selection before
                        proceeding.
                    </p>

                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            padding: '1.8rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            margin: '1.5rem 0',
                            textAlign: 'left',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--accent-gold)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {theaterName}
                        </div>

                        <div
                            style={{
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {selectedShowtime.movieTitle}
                        </div>

                        <div
                            style={{
                                fontSize: '1rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <i className="fas fa-calendar-alt"></i>{' '}
                            {new Date(
                                selectedShowtime.date
                            ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}{' '}
                            at{' '}
                            <strong
                                style={{
                                    color: 'var(--accent-gold)',
                                }}
                            >
                                {selectedShowtime.time}
                            </strong>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: '0.75rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() =>
                                    alert(
                                        'Ticket booking is currently a demo feature.'
                                    )
                                }
                            >
                                <i className="fas fa-credit-card"></i>{' '}
                                Proceed to Checkout
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() =>
                                    setSelectedShowtime(null)
                                }
                            >
                                <i className="fas fa-arrow-left"></i>{' '}
                                Back to Showtimes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const sortedDates = Object.keys(theaterData).sort()

    return (
        <div className="showtimes-container">
            <div className="showtimes-header">
                <h2>
                    <i className="fas fa-film"></i>{' '}
                    {theaterName}
                </h2>

                <p
                    style={{
                        color: '#aaa',
                        marginBottom: '1.5rem',
                    }}
                >
                    Movie Showtimes
                </p>
            </div>

            {sortedDates.map((dateStr) => {
                const dayData = theaterData[dateStr]

                return (
                    <div
                        className="showtimes-day"
                        key={dateStr}
                    >
                        <h3
                            style={{
                                color: '#f5c518',
                                marginBottom: '1rem',
                            }}
                        >
                            <i className="fas fa-calendar"></i>{' '}
                            {dayData.dayLabel} -{' '}
                            {new Date(
                                dateStr
                            ).toLocaleDateString(
                                'en-US',
                                {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                }
                            )}
                        </h3>

                        <div className="movies-showtimes">
                            {Object.entries(
                                dayData.movies
                            ).map(
                                ([
                                     movieTitle,
                                     movieData,
                                 ]) => (
                                    <div
                                        className="movie-showtimes-card"
                                        key={movieTitle}
                                    >
                                        <div className="movie-showtimes-info">
                                            <h4>
                                                {movieTitle}
                                            </h4>

                                            <div className="movie-meta">
                                                <span>
                                                    <i className="fas fa-clock"></i>{' '}
                                                    {
                                                        movieData.duration
                                                    }
                                                </span>

                                                <span>
                                                    <i className="fas fa-star"></i>{' '}
                                                    {
                                                        movieData.rating
                                                    }
                                                </span>

                                                <span>
                                                    <i className="fas fa-tv"></i>{' '}
                                                    {
                                                        movieData.availableScreens
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="showtimes-list">
                                            {movieData.showtimes.map(
                                                (time) => (
                                                    <button
                                                        type="button"
                                                        className="showtime-btn"
                                                        key={time}
                                                        onClick={() =>
                                                            setSelectedShowtime(
                                                                {
                                                                    movieTitle,
                                                                    date: dateStr,
                                                                    time,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        {time}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Showtimes