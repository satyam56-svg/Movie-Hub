import { useCallback, useEffect, useState } from 'react'

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const SEARCH_RADIUS = 15000

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getCoordinates(element) {
    if (element.type === 'node') {
        return {
            lat: element.lat,
            lon: element.lon,
        }
    }

    if (element.center) {
        return {
            lat: element.center.lat,
            lon: element.center.lon,
        }
    }

    return null
}

function getAddress(tags = {}) {
    const parts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:suburb'],
        tags['addr:city'],
        tags['addr:state'],
    ].filter(Boolean)

    return parts.length > 0
        ? parts.join(', ')
        : tags['addr:full'] || 'Address not available'
}

function getWebsite(tags = {}) {
    return (
        tags.website ||
        tags['contact:website'] ||
        tags.url ||
        ''
    )
}

function normalizeWebsite(url) {
    if (!url) {
        return ''
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    return `https://${url}`
}

function NearbyTheaters() {
    const [locationName, setLocationName] = useState('Detecting location...')
    const [theaters, setTheaters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedTheater, setSelectedTheater] = useState(null)

    const reverseGeocode = useCallback(async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Reverse geocoding failed')
            }

            const data = await response.json()

            const address = data.address || {}

            const name =
                address.suburb ||
                address.neighbourhood ||
                address.city_district ||
                address.city ||
                address.town ||
                address.village ||
                'Current Location'

            const state = address.state || ''

            setLocationName(
                state && !name.includes(state)
                    ? `${name}, ${state}`
                    : name
            )
        } catch (err) {
            console.error('Reverse geocoding error:', err)
            setLocationName('Current Location')
        }
    }, [])

    const fetchTheaters = useCallback(async (lat, lon) => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/theaters?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
            )

            if (!response.ok) {
                throw new Error(
                    `Theater API returned HTTP ${response.status}`
                )
            }

            const data = await response.json()

            const results = (data.elements || [])
                .map((element) => {
                    const coordinates = getCoordinates(element)

                    if (!coordinates) {
                        return null
                    }

                    const tags = element.tags || {}

                    const name =
                        tags.name ||
                        tags['name:en'] ||
                        tags['official_name']

                    if (!name) {
                        return null
                    }

                    const distance = calculateDistance(
                        lat,
                        lon,
                        coordinates.lat,
                        coordinates.lon
                    )

                    return {
                        id: `${element.type}-${element.id}`,
                        name,
                        latitude: coordinates.lat,
                        longitude: coordinates.lon,
                        distance,
                        address: getAddress(tags),
                        website: normalizeWebsite(getWebsite(tags)),
                        phone:
                            tags.phone ||
                            tags['contact:phone'] ||
                            '',
                        type: tags.amenity === 'cinema'
                            ? 'Cinema'
                            : 'Theatre',
                    }
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance)

            const uniqueTheaters = []
            const seen = new Set()

            for (const theater of results) {
                const key = `${theater.name
                    .toLowerCase()
                    .replace(/\s+/g, ' ')
                    .trim()}-${theater.latitude.toFixed(4)}-${theater.longitude.toFixed(4)}`

                if (!seen.has(key)) {
                    seen.add(key)
                    uniqueTheaters.push(theater)
                }
            }

            setTheaters(uniqueTheaters.slice(0, 20))
        } catch (err) {
            console.error('Theater search failed:', err)

            setTheaters([])
            setError(
                'Unable to load nearby theaters right now. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }, [])


    const detectLocation = useCallback(() => {
        setLoading(true)
        setError('')
        setLocationName('Detecting location...')

        if (!navigator.geolocation) {
            setLoading(false)
            setError(
                'Location services are not supported by this browser.'
            )
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lon = position.coords.longitude

                await reverseGeocode(lat, lon)
                await fetchTheaters(lat, lon)
            },
            (geoError) => {
                console.error('Geolocation error:', geoError)

                setLoading(false)

                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setError(
                        'Location permission is required to find nearby theaters.'
                    )
                } else {
                    setError(
                        'Unable to determine your current location.'
                    )
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000,
            }
        )
    }, [fetchTheaters, reverseGeocode])

    useEffect(() => {
        const timer = setTimeout(() => {
            detectLocation()
        }, 0)

        return () => clearTimeout(timer)
    }, [detectLocation])

    const openDirections = (theater) => {
        const url =
            `https://www.google.com/maps/dir/?api=1` +
            `&destination=${theater.latitude},${theater.longitude}`

        window.open(
            url,
            '_blank',
            'noopener,noreferrer'
        )
    }

    const openWebsite = (theater) => {
        if (!theater.website) {
            return
        }

        window.open(
            theater.website,
            '_blank',
            'noopener,noreferrer'
        )
    }

    return (
        <section id="theaters" className="section">
            <div className="container">

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                    }}
                >
                    <h2 className="section-title">
                        Nearby Theaters
                    </h2>

                    <button
                        type="button"
                        onClick={detectLocation}
                        disabled={loading}
                        aria-label="Refresh nearby theaters"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            cursor: loading
                                ? 'not-allowed'
                                : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        <i
                            className={`fas fa-sync-alt ${
                                loading ? 'fa-spin' : ''
                            }`}
                        ></i>
                    </button>
                </div>

                <div
                    style={{
                        color: 'var(--accent-gold)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{locationName}</span>
                </div>

                {loading && (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>
                            Finding real theaters near you...
                        </span>
                    </div>
                )}

                {!loading && error && (
                    <div
                        style={{
                            padding: '2.5rem',
                            textAlign: 'center',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-surface)',
                        }}
                    >
                        <i
                            className="fas fa-exclamation-circle"
                            style={{
                                fontSize: '2rem',
                                color: 'var(--accent-gold)',
                                marginBottom: '1rem',
                            }}
                        ></i>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={detectLocation}
                            className="btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading &&
                    !error &&
                    theaters.length === 0 && (
                        <div
                            style={{
                                padding: '2.5rem',
                                textAlign: 'center',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--bg-surface)',
                            }}
                        >
                            <i
                                className="fas fa-film"
                                style={{
                                    fontSize: '2rem',
                                    color: 'var(--accent-gold)',
                                    marginBottom: '1rem',
                                }}
                            ></i>

                            <p>
                                No real theaters were found within
                                15 km of your location.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    theaters.length > 0 && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: '1rem',
                            }}
                        >
                            {theaters.map((theater) => (
                                <button
                                    key={theater.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedTheater(theater)
                                    }
                                    style={{
                                        textAlign: 'left',
                                        padding: '1.25rem',
                                        border:
                                            '1px solid var(--border-subtle)',
                                        borderRadius:
                                            'var(--radius-lg)',
                                        background:
                                            'var(--bg-surface)',
                                        color:
                                            'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition:
                                            'transform 0.2s ease, border-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            'translateY(-3px)'
                                        e.currentTarget.style.borderColor =
                                            'var(--accent-gold)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            'translateY(0)'
                                        e.currentTarget.style.borderColor =
                                            'var(--border-subtle)'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            gap: '1rem',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: '1.05rem',
                                            }}
                                        >
                                            {theater.name}
                                        </h3>

                                        <span
                                            style={{
                                                color:
                                                    'var(--accent-gold)',
                                                whiteSpace:
                                                    'nowrap',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            {theater.distance.toFixed(
                                                1
                                            )}{' '}
                                            km
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            margin: '0 0 0.6rem',
                                            color:
                                                'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <i className="fas fa-map-marker-alt"></i>{' '}
                                        {theater.address}
                                    </p>

                                    <span
                                        style={{
                                            fontSize: '0.8rem',
                                            color:
                                                'var(--text-muted)',
                                        }}
                                    >
                                        {theater.type} • View options
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
            </div>

            {selectedTheater && (
                <div
                    className="modal"
                    style={{
                        display: 'flex',
                        zIndex: 1000,
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedTheater(null)
                        }
                    }}
                >
                    <div className="modal-content">
                        <button
                            className="close"
                            type="button"
                            onClick={() =>
                                setSelectedTheater(null)
                            }
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <h2
                            style={{
                                marginBottom: '0.5rem',
                            }}
                        >
                            {selectedTheater.name}
                        </h2>

                        <p
                            style={{
                                color: 'var(--text-secondary)',
                                marginBottom: '0.5rem',
                            }}
                        >
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {selectedTheater.address}
                        </p>

                        <p
                            style={{
                                color: 'var(--accent-gold)',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {selectedTheater.distance.toFixed(1)} km
                            away
                        </p>

                        {selectedTheater.phone && (
                            <p
                                style={{
                                    color:
                                        'var(--text-secondary)',
                                }}
                            >
                                <i className="fas fa-phone"></i>{' '}
                                {selectedTheater.phone}
                            </p>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                gap: '0.75rem',
                                flexWrap: 'wrap',
                                marginTop: '1.5rem',
                            }}
                        >
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() =>
                                    openDirections(
                                        selectedTheater
                                    )
                                }
                            >
                                <i className="fas fa-directions"></i>{' '}
                                Directions
                            </button>

                            {selectedTheater.website ? (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() =>
                                        openWebsite(
                                            selectedTheater
                                        )
                                    }
                                >
                                    <i className="fas fa-ticket-alt"></i>{' '}
                                    Website / Booking
                                </button>
                            ) : (
                                <span
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border:
                                            '1px solid var(--border-subtle)',
                                        borderRadius:
                                            'var(--radius-md)',
                                        color:
                                            'var(--text-muted)',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    Booking link unavailable
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default NearbyTheaters