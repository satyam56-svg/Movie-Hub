import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'
import { authFetch } from '../api/authFetch'

function MyReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchMyReviews = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('Please login to view your reviews.')
                setLoading(false)
                return
            }

            try {
                const response = await authFetch(
                    `${API_BASE_URL}/api/reviews/my`
                )

                if (!response.ok) {
                    throw new Error('Failed to load reviews')
                }

                const data = await response.json()
                setReviews(data)
            } catch (error) {
                console.error('My reviews fetch error:', error)
                setError('Unable to load your reviews.')
            } finally {
                setLoading(false)
            }
        }

        fetchMyReviews()
    }, [])

    if (loading) {
        return (
            <section id="my-reviews" className="section my-reviews-section">
                <div className="container">
                    <div className="my-reviews-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading your reviews...</span>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="section my-reviews-section">
                <div className="container">
                    <div className="my-reviews-state error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="section my-reviews-section" id="my-reviews">
            <div className="container">

                <div className="my-reviews-title-row">
                    <div>
                        <h2 className="section-title">My Reviews</h2>
                        <p className="my-reviews-subtitle">
                            Your movie ratings and thoughts
                        </p>
                    </div>

                    {reviews.length > 0 && (
                        <div className="review-count">
                            <i className="fas fa-comments"></i>
                            {reviews.length}{' '}
                            {reviews.length === 1 ? 'Review' : 'Reviews'}
                        </div>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className="my-reviews-empty">
                        <div className="empty-review-icon">
                            <i className="fas fa-comment-slash"></i>
                        </div>

                        <h3>No Reviews Yet</h3>

                        <p>
                            You haven't reviewed any movie yet.
                            Start watching movies and share your thoughts!
                        </p>

                        <a href="#top-movies" className="btn-primary">
                            <i className="fas fa-film"></i>
                            Explore Movies
                        </a>
                    </div>
                ) : (
                    <div className="my-reviews-list">
                        {reviews.map((review) => (
                            <article
                                className="my-review-card"
                                key={review.id}
                            >
                                <div className="my-review-header">

                                    <div className="my-review-movie">
                                        <div className="review-movie-icon">
                                            <i className="fas fa-film"></i>
                                        </div>

                                        <div>
                                            <h3>
                                                {review.movieTitle ||
                                                    'Unknown Movie'}
                                            </h3>

                                            <span className="my-review-date">
                                                <i className="far fa-calendar-alt"></i>

                                                {review.createdAt
                                                    ? new Date(
                                                        review.createdAt
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        }
                                                    )
                                                    : 'Date unavailable'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-review-rating">
                                        <span className="rating-star">★</span>
                                        <strong>{review.rating}</strong>
                                        <span>/5</span>
                                    </div>
                                </div>

                                <div className="my-review-divider"></div>

                                <p className="my-review-text">
                                    <i className="fas fa-quote-left"></i>

                                    {review.reviewText ||
                                        'No review text provided.'}
                                </p>

                                <div className="my-review-footer">
                                    <span>
                                        <i className="fas fa-check-circle"></i>
                                        Your Review
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default MyReviews