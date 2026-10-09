import { useState } from 'react'

const CINEMA_BRANDS = [
    {
        id: 'pvr',
        name: 'PVR Cinemas',
        location: 'Multiple Locations',
        status: 'NOW SHOWING',
        statusType: 'showing',
        ticketUrl: 'https://www.pvrcinemas.com',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80',
    },
    {
        id: 'inox',
        name: 'INOX Movies',
        location: 'Multiple Locations',
        status: 'NOW SHOWING',
        statusType: 'showing',
        ticketUrl: 'https://www.inoxmovies.com',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=200&auto=format&fit=crop&q=80',
    },
    {
        id: 'cinepolis',
        name: 'Cinepolis',
        location: 'Multiple Locations',
        status: 'NOW SHOWING',
        statusType: 'showing',
        ticketUrl: 'https://www.cinepolisindia.com',
        image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&auto=format&fit=crop&q=80',
    },
    {
        id: 'carnival',
        name: 'Carnival Cinemas',
        location: 'Multiple Locations',
        status: 'COMING SOON',
        statusType: 'coming_soon',
        ticketUrl: 'https://www.carnivalcinemas.com',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80',
    },
]

function InCinemas({ locationName = 'Kolkata, West Bengal', selectedMovie = null }) {
    const [fallbackNotice, setFallbackNotice] = useState('')

    const handleTicketClick = (cinema) => {
        if (cinema.ticketUrl) {
            window.open(cinema.ticketUrl, '_blank', 'noopener,noreferrer')
        } else {
            setFallbackNotice(`Booking links for ${cinema.name} require live API credentials.`)
            setTimeout(() => setFallbackNotice(''), 4000)
        }
    }

    return (
        <div className="in-cinemas-container">
            <div className="in-cinemas-header">
                <i className="fas fa-film in-cinemas-icon"></i>
                <h2>In Cinemas</h2>
            </div>

            {selectedMovie && (
                <p className="in-cinemas-subtitle">
                    Now playing & upcoming showtimes for <strong>{selectedMovie.title}</strong> near {locationName}
                </p>
            )}

            {fallbackNotice && (
                <div className="auth-error" style={{ marginBottom: '1rem' }}>
                    {fallbackNotice}
                </div>
            )}

            <div className="in-cinemas-grid">
                {CINEMA_BRANDS.map((cinema) => {
                    const isComingSoon = cinema.statusType === 'coming_soon'

                    return (
                        <div
                            key={cinema.id}
                            className={`cinema-card ${isComingSoon ? 'coming-soon-card' : ''}`}
                            onClick={() => handleTicketClick(cinema)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleTicketClick(cinema)
                                }
                            }}
                            title={`Book tickets at ${cinema.name}`}
                        >
                            <img
                                src={cinema.image}
                                alt={cinema.name}
                                className="cinema-thumb"
                                loading="lazy"
                            />

                            <div className="cinema-info">
                                <h3 className="cinema-name">{cinema.name}</h3>
                                <span className="cinema-location">
                                    {locationName && locationName !== 'Detecting location...'
                                        ? locationName
                                        : cinema.location}
                                </span>

                                <div className="cinema-badge-row">
                                    <span className={`cinema-badge ${isComingSoon ? 'badge-coming-soon' : 'badge-now-showing'}`}>
                                        {cinema.status}
                                    </span>
                                </div>
                            </div>

                            <div className="cinema-action">
                                <span
                                    className={`ticket-pill ${isComingSoon ? 'ticket-pill-white' : 'ticket-pill-gold'}`}
                                    aria-label="Ticket"
                                >
                                    <i className="fas fa-ticket-alt"></i>
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="in-cinemas-disclaimer">
                <i className="fas fa-info-circle"></i>
                <span>
                    Showtimes & booking URLs connect directly to official cinema portals. Live seat availability requires active theater API credentials.
                </span>
            </div>
        </div>
    )
}

export default InCinemas
