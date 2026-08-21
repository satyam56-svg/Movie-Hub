import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'

function Reviews({ movieId }) {
    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [rating, setRating] = useState('')
    const [reviewText, setReviewText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [editingReviewId, setEditingReviewId] = useState(null)
    const [actionError, setActionError] = useState('')

    const username = localStorage.getItem('username')

    useEffect(() => {
        if (!movieId) {
            return
        }

        let cancelled = false

        const loadReviews = async () => {
            try {
                setLoading(true)
                setError('')

                const token = localStorage.getItem('token')

                const headers = token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {}

                const response = await fetch(
                    `${API_BASE_URL}/api/reviews/movie/${movieId}`,
                    {
                        headers,
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load reviews')
                }

                const data = await response.json()

                if (cancelled) {
                    return
                }

                const reviewData = data || []

                setReviews(reviewData)

                if (reviewData.length > 0) {
                    const total = reviewData.reduce(
                        (sum, review) =>
                            sum + Number(review.rating),
                        0
                    )

                    setAverageRating(
                        (total / reviewData.length).toFixed(1)
                    )
                } else {
                    setAverageRating(null)
                }
            } catch (error) {
                if (cancelled) {
                    return
                }

                console.error('Reviews API error:', error)
                setError('Unable to load reviews.')
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadReviews()

        return () => {
            cancelled = true
        }
    }, [movieId])

    const fetchReviews = async () => {
        const token = localStorage.getItem('token')

        const headers = token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {}

        const response = await fetch(
            `${API_BASE_URL}/api/reviews/movie/${movieId}`,
            {
                headers,
            }
        )

        if (!response.ok) {
            throw new Error('Failed to load reviews')
        }

        const data = await response.json()
        const reviewData = data || []

        setReviews(reviewData)

        if (reviewData.length > 0) {
            const total = reviewData.reduce(
                (sum, review) =>
                    sum + Number(review.rating),
                0
            )

            setAverageRating(
                (total / reviewData.length).toFixed(1)
            )
        } else {
            setAverageRating(null)
        }
    }

    const resetForm = () => {
        setRating('')
        setReviewText('')
        setEditingReviewId(null)
        setActionError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const token = localStorage.getItem('token')

        if (!token) {
            setActionError('Please login to add or edit a review.')
            return
        }

        if (!rating) {
            setActionError('Please select a rating.')
            return
        }

        try {
            setSubmitting(true)
            setActionError('')

            const isEditing = editingReviewId !== null

            const url = isEditing
                ? `${API_BASE_URL}/api/reviews/${editingReviewId}`
                : `${API_BASE_URL}/api/reviews`

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieId: Number(movieId),
                    rating: Number(rating),
                    reviewText: reviewText.trim(),
                }),
            })

            if (!response.ok) {
                const message = await response.text()

                throw new Error(
                    message ||
                    (isEditing
                        ? 'Failed to update review'
                        : 'Failed to create review')
                )
            }

            resetForm()
            await fetchReviews()
        } catch (error) {
            console.error('Review submit error:', error)
            setActionError(
                error.message || 'Unable to save review.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (review) => {
        setEditingReviewId(review.id)
        setRating(review.rating)
        setReviewText(review.reviewText || '')
        setActionError('')
    }

    const handleDelete = async (reviewId) => {
        const token = localStorage.getItem('token')

        if (!token) {
            setActionError('Please login to delete a review.')
            return
        }

        try {
            setActionError('')

            const response = await fetch(
                `${API_BASE_URL}/api/reviews/${reviewId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                const message = await response.text()

                throw new Error(
                    message || 'Failed to delete review'
                )
            }

            if (editingReviewId === reviewId) {
                resetForm()
            }

            await fetchReviews()
        } catch (error) {
            console.error('Review delete error:', error)
            setActionError(
                error.message || 'Unable to delete review.'
            )
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading user reviews...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="loading">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
            </div>
        )
    }

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h3>Community Reviews</h3>

                {averageRating !== null && (
                    <div className="average-rating">
                        <span>Average Rating:</span>
                        <strong>⭐ {averageRating} / 5</strong>
                    </div>
                )}
            </div>

            {username ? (
                <form
                    className="review-form"
                    onSubmit={handleSubmit}
                >
                    <h4>
                        <i className="fas fa-pen-nib"></i>{' '}
                        {editingReviewId !== null
                            ? 'Edit Your Review'
                            : 'Write a Review'}
                    </h4>

                    <div className="form-group">
                        <label htmlFor="review-rating">
                            Rating (1 to 5 stars)
                        </label>

                        <select
                            id="review-rating"
                            value={rating}
                            onChange={(event) =>
                                setRating(event.target.value)
                            }
                            disabled={submitting}
                        >
                            <option value="">
                                Select rating...
                            </option>
                            <option value="5">
                                ⭐⭐⭐⭐⭐ (5/5) - Masterpiece
                            </option>
                            <option value="4">
                                ⭐⭐⭐⭐ (4/5) - Great
                            </option>
                            <option value="3">
                                ⭐⭐⭐ (3/5) - Good
                            </option>
                            <option value="2">
                                ⭐⭐ (2/5) - Mediocre
                            </option>
                            <option value="1">
                                ⭐ (1/5) - Poor
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="review-text">
                            Your Review
                        </label>

                        <textarea
                            id="review-text"
                            value={reviewText}
                            onChange={(event) =>
                                setReviewText(event.target.value)
                            }
                            placeholder="Share your thoughts about this movie..."
                            rows="3"
                            disabled={submitting}
                        />
                    </div>

                    {actionError && (
                        <div className="auth-error review-error">
                            {actionError}
                        </div>
                    )}

                    <div className="review-form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Submitting...'
                                : editingReviewId !== null
                                    ? 'Update Review'
                                    : 'Submit Review'}
                        </button>

                        {editingReviewId !== null && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="loading review-state">
                    <span>
                        Please log in to leave a review.
                    </span>
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="loading review-state">
                    <span>
                        No user reviews yet. Be the first to
                        share your thoughts!
                    </span>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => {
                        const isOwnReview =
                            username &&
                            review.username === username

                        return (
                            <div
                                className="review-card"
                                key={review.id}
                            >
                                <div className="review-header">
                                    <strong className="review-author">
                                        <i className="fas fa-user-circle review-author-icon"></i>
                                        {review.username}
                                    </strong>

                                    <span className="review-rating">
                                        ⭐ {review.rating}/5
                                    </span>
                                </div>

                                {review.reviewText && (
                                    <p className="review-text">
                                        {review.reviewText}
                                    </p>
                                )}

                                <div className="review-meta-row">
                                    {review.createdAt && (
                                        <small className="review-date">
                                            {new Date(
                                                review.createdAt
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </small>
                                    )}

                                    {isOwnReview && (
                                        <div className="review-actions">
                                            <button
                                                type="button"
                                                className="btn-secondary review-action-btn"
                                                onClick={() =>
                                                    handleEdit(
                                                        review
                                                    )
                                                }
                                            >
                                                <i className="fas fa-edit"></i>{' '}
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-danger review-action-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        review.id
                                                    )
                                                }
                                            >
                                                <i className="fas fa-trash"></i>{' '}
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Reviews