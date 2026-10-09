const STREAMING_SERVICES = [
    {
        id: 'netflix',
        name: 'Netflix',
        price: 'Included',
        url: 'https://www.netflix.com',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=150&auto=format&fit=crop&q=80',
        type: 'streaming',
        icon: 'play',
    },
    {
        id: 'prime',
        name: 'Amazon Prime',
        price: 'Included',
        url: 'https://www.primevideo.com',
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=150&auto=format&fit=crop&q=80',
        type: 'streaming',
        icon: 'play',
    },
    {
        id: 'youtube',
        name: 'YouTube Movies',
        price: '$3.99',
        url: 'https://www.youtube.com/feed/store',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=80',
        type: 'streaming',
        icon: 'play',
    },
]

const RENT_BUY_SERVICES = [
    {
        id: 'appletv',
        name: 'Apple TV',
        price: '$3.99',
        url: 'https://tv.apple.com',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&auto=format&fit=crop&q=80',
        type: 'rent_buy',
        icon: 'cart',
    },
    {
        id: 'googleplay',
        name: 'Google Play',
        price: '$3.99',
        url: 'https://play.google.com/store/movies',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80',
        type: 'rent_buy',
        icon: 'cart',
    },
]

function WhereToWatch({ movie = null }) {
    const handleServiceClick = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div className="where-to-watch-container">
            <div className="where-to-watch-header">
                <i className="fas fa-play-circle where-to-watch-icon"></i>
                <h2>Where to Watch</h2>
            </div>

            <div className="watch-section-wrapper">
                <div className="watch-section-title">
                    <i className="fas fa-globe"></i>
                    <span>Online Streaming</span>
                </div>

                {/* Subcategory: Streaming */}
                <div className="watch-subcategory">
                    <div className="watch-subcategory-title">
                        <i className="fas fa-tv"></i>
                        <span>Streaming</span>
                    </div>

                    <div className="watch-services-grid">
                        {STREAMING_SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="watch-service-card"
                                onClick={() => handleServiceClick(service.url)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleServiceClick(service.url)
                                    }
                                }}
                            >
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="service-thumb"
                                    loading="lazy"
                                />

                                <div className="service-info">
                                    <h4 className="service-name">{service.name}</h4>
                                    <span className="service-price">{service.price}</span>
                                </div>

                                <div className="service-action">
                                    <span className="action-circle-yellow">
                                        <i className="fas fa-play"></i>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subcategory: Rent/Buy */}
                <div className="watch-subcategory" style={{ marginTop: '1.5rem' }}>
                    <div className="watch-subcategory-title">
                        <i className="fas fa-dollar-sign"></i>
                        <span>Rent/Buy</span>
                    </div>

                    <div className="watch-services-grid">
                        {RENT_BUY_SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="watch-service-card"
                                onClick={() => handleServiceClick(service.url)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleServiceClick(service.url)
                                    }
                                }}
                            >
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="service-thumb"
                                    loading="lazy"
                                />

                                <div className="service-info">
                                    <h4 className="service-name">{service.name}</h4>
                                    <span className="service-price">{service.price}</span>
                                </div>

                                <div className="service-action">
                                    <span className="action-circle-yellow">
                                        <i className="fas fa-shopping-cart"></i>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhereToWatch
