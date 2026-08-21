import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [reviews, setReviews] = useState([])

    const [loading, setLoading] = useState(true)
    const [usersLoading, setUsersLoading] = useState(true)
    const [reviewsLoading, setReviewsLoading] = useState(true)

    const [error, setError] = useState('')
    const [usersError, setUsersError] = useState('')
    const [reviewsError, setReviewsError] = useState('')

    const [actionLoading, setActionLoading] = useState(null)

    // ==========================================================
    // SCRAPER STATE
    // ==========================================================

    const [scraping, setScraping] = useState(false)
    const [scrapeResult, setScrapeResult] = useState(null)
    const [scrapeError, setScrapeError] = useState('')
    const [scrapeLimit, setScrapeLimit] = useState(5)

    // ==========================================================
    // FETCH USERS
    // ==========================================================

    const fetchUsers = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setUsersError('Admin authentication required.')
            setUsersLoading(false)
            return
        }

        try {
            setUsersError('')

            const response = await fetch(
                `${API_BASE_URL}/api/admin/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Access denied. Admin only.')
                }

                throw new Error('Failed to load users')
            }

            const data = await response.json()
            setUsers(data)
        } catch (error) {
            console.error('Admin users fetch error:', error)

            setUsersError(
                error.message || 'Unable to load users.'
            )
        } finally {
            setUsersLoading(false)
        }
    }

    // ==========================================================
    // FETCH REVIEWS
    // ==========================================================

    const fetchReviews = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setReviewsError('Admin authentication required.')
            setReviewsLoading(false)
            return
        }

        try {
            setReviewsError('')

            const response = await fetch(
                `${API_BASE_URL}/api/admin/reviews`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Access denied. Admin only.')
                }

                throw new Error('Failed to load reviews')
            }

            const data = await response.json()
            setReviews(data)
        } catch (error) {
            console.error('Admin reviews fetch error:', error)

            setReviewsError(
                error.message || 'Unable to load reviews.'
            )
        } finally {
            setReviewsLoading(false)
        }
    }

    // ==========================================================
    // FETCH DASHBOARD
    // ==========================================================

    useEffect(() => {
        const fetchDashboardStats = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('Admin authentication required.')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/admin/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('Access denied. Admin only.')
                    }

                    throw new Error('Failed to load dashboard')
                }

                const data = await response.json()
                setStats(data)

                await Promise.all([
                    fetchUsers(),
                    fetchReviews(),
                ])
            } catch (error) {
                console.error('Admin dashboard error:', error)

                setError(
                    error.message ||
                    'Unable to load admin dashboard.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardStats()
    }, [])

    // ==========================================================
    // RUN SCRAPER
    // ==========================================================

    const handleScrape = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setScrapeError('Admin authentication required.')
            return
        }

        const confirmed = window.confirm(
            `Run the MovieHub scraper for ${scrapeLimit} movies?\n\n` +
            `This will scrape ${scrapeLimit} movies and update the MovieHub database.`
        )

        if (!confirmed) {
            return
        }

        try {
            setScraping(true)
            setScrapeError('')
            setScrapeResult(null)

            const response = await fetch(
                `${API_BASE_URL}/api/admin/scrape?limit=${scrapeLimit}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    'Scraping failed.'
                )
            }

            setScrapeResult(data)

            // Refresh movie count after successful scraping.
            const dashboardResponse = await fetch(
                `${API_BASE_URL}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (dashboardResponse.ok) {
                const updatedStats =
                    await dashboardResponse.json()

                setStats(updatedStats)
            }
        } catch (error) {
            console.error('Scraper error:', error)

            setScrapeError(
                error.message ||
                'Unable to run scraper.'
            )
        } finally {
            setScraping(false)
        }
    }

    // ==========================================================
    // ROLE CHANGE
    // ==========================================================

    const handleRoleChange = async (user) => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        const newRole =
            user.role === 'ADMIN'
                ? 'USER'
                : 'ADMIN'

        const confirmed = window.confirm(
            `Change ${user.username}'s role to ${newRole}?`
        )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(`role-${user.id}`)

            const response = await fetch(
                `${API_BASE_URL}/api/admin/users/${user.id}/role?role=${newRole}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update user role')
            }

            const updatedUser = await response.json()

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                            ...currentUser,
                            role: updatedUser.role,
                        }
                        : currentUser
                )
            )
        } catch (error) {
            console.error('Role update error:', error)

            alert(
                error.message ||
                'Unable to update user role.'
            )
        } finally {
            setActionLoading(null)
        }
    }

    // ==========================================================
    // DELETE USER
    // ==========================================================

    const handleDeleteUser = async (user) => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${user.username}"?`
        )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(`delete-user-${user.id}`)

            const response = await fetch(
                `${API_BASE_URL}/api/admin/users/${user.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (currentUser) =>
                        currentUser.id !== user.id
                )
            )

            setStats((currentStats) => ({
                ...currentStats,
                totalUsers: Math.max(
                    0,
                    currentStats.totalUsers - 1
                ),
            }))
        } catch (error) {
            console.error('Delete user error:', error)

            alert(
                error.message ||
                'Unable to delete user.'
            )
        } finally {
            setActionLoading(null)
        }
    }

    // ==========================================================
    // DELETE REVIEW
    // ==========================================================

    const handleDeleteReview = async (review) => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        const confirmed = window.confirm(
            `Delete this review by ${review.username}?`
        )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(`delete-review-${review.id}`)

            const response = await fetch(
                `${API_BASE_URL}/api/admin/reviews/${review.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete review')
            }

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (currentReview) =>
                        currentReview.id !== review.id
                )
            )

            setStats((currentStats) => ({
                ...currentStats,
                totalReviews: Math.max(
                    0,
                    currentStats.totalReviews - 1
                ),
            }))
        } catch (error) {
            console.error('Delete review error:', error)

            alert(
                error.message ||
                'Unable to delete review.'
            )
        } finally {
            setActionLoading(null)
        }
    }

    // ==========================================================
    // LOADING STATE
    // ==========================================================

    if (loading) {
        return (
            <section className="section admin-dashboard-section">
                <div className="container">
                    <div className="admin-dashboard-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>
                            Loading admin dashboard...
                        </span>
                    </div>
                </div>
            </section>
        )
    }

    // ==========================================================
    // ERROR STATE
    // ==========================================================

    if (error) {
        return (
            <section className="section admin-dashboard-section">
                <div className="container">
                    <div className="admin-dashboard-error">
                        <div className="admin-error-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>

                        <div>
                            <h3>Admin Access Required</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // ==========================================================
    // DASHBOARD
    // ==========================================================

    return (
        <section
            id="admin-dashboard"
            className="section admin-dashboard-section"
        >
            <div className="container">

                {/* ================= HEADER ================= */}

                <div className="admin-dashboard-header">
                    <div>
                        <span className="admin-eyebrow">
                            <i className="fas fa-shield-alt"></i>
                            ADMIN PANEL
                        </span>

                        <h2 className="section-title">
                            Admin Dashboard
                        </h2>

                        <p className="admin-dashboard-subtitle">
                            Manage MovieHub content, users and
                            reviews from one place.
                        </p>
                    </div>

                    <div className="admin-status">
                        <span className="admin-status-dot"></span>
                        Administrator
                    </div>
                </div>

                {/* ================= STATISTICS ================= */}

                <div className="admin-stats-grid">

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div className="admin-stat-icon users-icon">
                                <i className="fas fa-users"></i>
                            </div>

                            <span className="admin-stat-badge">
                                USERS
                            </span>
                        </div>

                        <div className="admin-stat-info">
                            <span className="admin-stat-label">
                                Total Users
                            </span>

                            <strong>
                                {stats.totalUsers}
                            </strong>

                            <span className="admin-stat-description">
                                Registered accounts
                            </span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div className="admin-stat-icon movies-icon">
                                <i className="fas fa-film"></i>
                            </div>

                            <span className="admin-stat-badge">
                                MOVIES
                            </span>
                        </div>

                        <div className="admin-stat-info">
                            <span className="admin-stat-label">
                                Total Movies
                            </span>

                            <strong>
                                {stats.totalMovies}
                            </strong>

                            <span className="admin-stat-description">
                                Movies available
                            </span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div className="admin-stat-icon reviews-icon">
                                <i className="fas fa-comments"></i>
                            </div>

                            <span className="admin-stat-badge">
                                REVIEWS
                            </span>
                        </div>

                        <div className="admin-stat-info">
                            <span className="admin-stat-label">
                                Total Reviews
                            </span>

                            <strong>
                                {stats.totalReviews}
                            </strong>

                            <span className="admin-stat-description">
                                User reviews submitted
                            </span>
                        </div>
                    </div>

                </div>

                {/* ================= MOVIE SCRAPER ================= */}

                <div className="admin-management-section admin-scraper-management">

                    <div className="admin-management-header">
                        <div>
            <span className="admin-eyebrow">
                <i className="fas fa-database"></i>
                DATA MANAGEMENT
            </span>

                            <h3>Movie Data Scraper</h3>

                            <p>
                                Scrape the latest movie data from the configured
                                sources and update the MovieHub database.
                            </p>
                        </div>

                        <div className="admin-scraper-controls">

                            <div className="admin-scrape-select-wrapper">
                                <i className="fas fa-film"></i>

                                <select
                                    value={scrapeLimit}
                                    onChange={(e) =>
                                        setScrapeLimit(Number(e.target.value))
                                    }
                                    disabled={scraping}
                                    className="admin-scrape-limit-select"
                                    aria-label="Number of movies to scrape"
                                >
                                    <option value={5}>5 Movies</option>
                                    <option value={10}>10 Movies</option>
                                    <option value={20}>20 Movies</option>
                                    <option value={50}>50 Movies</option>
                                    <option value={100}>100 Movies</option>
                                </select>

                                <i className="fas fa-chevron-down admin-select-arrow"></i>
                            </div>

                            <button
                                type="button"
                                className="admin-action-btn role-btn admin-scrape-btn"
                                onClick={handleScrape}
                                disabled={scraping}
                            >
                                {scraping ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Scraping {scrapeLimit}...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sync-alt"></i>
                                        Run Scraper
                                    </>
                                )}
                            </button>

                        </div>
                    </div>

                    {/* SCRAPER ERROR */}

                    {scrapeError && (
                        <div className="admin-scraper-error">
                            <div className="admin-scraper-message-icon">
                                <i className="fas fa-exclamation-circle"></i>
                            </div>

                            <div>
                                <strong>Scraping failed</strong>
                                <span>{scrapeError}</span>
                            </div>
                        </div>
                    )}

                    {/* SCRAPER SUCCESS */}

                    {scrapeResult && (
                        <div className="admin-scraper-result">

                            <div className="admin-scraper-result-header">

                                <div className="admin-scraper-success-icon">
                                    <i className="fas fa-check"></i>
                                </div>

                                <div className="admin-scraper-result-message">
                                    <strong>
                                        Scraping completed successfully
                                    </strong>

                                    <span>
                        Movie database has been updated successfully.
                    </span>
                                </div>

                            </div>

                            <div className="admin-scraper-result-stats">

                                <div className="admin-scraper-stat">
                                    <strong>
                                        {scrapeResult.inserted}
                                    </strong>

                                    <span>Inserted</span>
                                </div>

                                <div className="admin-scraper-stat">
                                    <strong>
                                        {scrapeResult.updated}
                                    </strong>

                                    <span>Updated</span>
                                </div>

                                <div className="admin-scraper-stat">
                                    <strong>
                                        {scrapeResult.totalProcessed}
                                    </strong>

                                    <span>Processed</span>
                                </div>

                            </div>

                        </div>
                    )}

                </div>

                {/* ================= USER MANAGEMENT ================= */}

                <div className="admin-management-section">

                    <div className="admin-management-header">
                        <div>
                            <span className="admin-eyebrow">
                                <i className="fas fa-user-cog"></i>
                                MANAGEMENT
                            </span>

                            <h3>User Management</h3>

                            <p>
                                View and manage MovieHub
                                accounts.
                            </p>
                        </div>

                        <span className="admin-user-count">
                            {users.length} Users
                        </span>
                    </div>

                    {usersLoading ? (
                        <div className="admin-users-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            Loading users...
                        </div>
                    ) : usersError ? (
                        <div className="admin-users-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {usersError}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="admin-users-empty">
                            <i className="fas fa-users-slash"></i>
                            <span>No users found.</span>
                        </div>
                    ) : (
                        <div className="admin-users-table-wrapper">
                            <table className="admin-users-table">
                                <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    <i className="fas fa-user"></i>
                                                </div>

                                                <div>
                                                    <strong>
                                                        {user.username}
                                                    </strong>

                                                    <span>
                                                            ID #{user.id}
                                                        </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                                <span className="admin-user-email">
                                                    {user.email}
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`admin-role-badge ${
                                                        user.role === 'ADMIN'
                                                            ? 'admin-role'
                                                            : 'user-role'
                                                    }`}
                                                >
                                                    <i
                                                        className={
                                                            user.role === 'ADMIN'
                                                                ? 'fas fa-shield-alt'
                                                                : 'fas fa-user'
                                                        }
                                                    ></i>

                                                    {user.role}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="admin-user-actions">

                                                <button
                                                    type="button"
                                                    className="admin-action-btn role-btn"
                                                    onClick={() =>
                                                        handleRoleChange(user)
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        `role-${user.id}`
                                                    }
                                                >
                                                    {actionLoading ===
                                                    `role-${user.id}` ? (
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <i className="fas fa-user-shield"></i>
                                                    )}

                                                    {user.role === 'ADMIN'
                                                        ? 'Make User'
                                                        : 'Make Admin'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-action-btn delete-btn"
                                                    onClick={() =>
                                                        handleDeleteUser(user)
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        `delete-user-${user.id}`
                                                    }
                                                >
                                                    {actionLoading ===
                                                    `delete-user-${user.id}` ? (
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <i className="fas fa-trash"></i>
                                                    )}

                                                    Delete
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                {/* ================= REVIEW MANAGEMENT ================= */}

                <div className="admin-management-section admin-reviews-management">

                    <div className="admin-management-header">
                        <div>
                            <span className="admin-eyebrow">
                                <i className="fas fa-comments"></i>
                                MODERATION
                            </span>

                            <h3>Review Management</h3>

                            <p>
                                Review and moderate MovieHub
                                user reviews.
                            </p>
                        </div>

                        <span className="admin-user-count">
                            {reviews.length} Reviews
                        </span>
                    </div>

                    {reviewsLoading ? (
                        <div className="admin-users-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            Loading reviews...
                        </div>
                    ) : reviewsError ? (
                        <div className="admin-users-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {reviewsError}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="admin-users-empty">
                            <i className="fas fa-comment-slash"></i>
                            <span>No reviews found.</span>
                        </div>
                    ) : (
                        <div className="admin-reviews-list">

                            {reviews.map((review) => (
                                <div
                                    className="admin-review-card"
                                    key={review.id}
                                >

                                    <div className="admin-review-top">

                                        <div className="admin-review-movie">
                                            <div className="admin-review-movie-icon">
                                                <i className="fas fa-film"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    {review.movieTitle ||
                                                        'Unknown Movie'}
                                                </strong>

                                                <span>
                                                    Review #{review.id}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="admin-review-rating">
                                            <i className="fas fa-star"></i>
                                            {review.rating}/5
                                        </div>

                                    </div>

                                    <div className="admin-review-meta">

                                        <span>
                                            <i className="fas fa-user"></i>
                                            {review.username}
                                        </span>

                                        <span>
                                            <i className="fas fa-calendar-alt"></i>
                                            {review.createdAt
                                                ? new Date(
                                                    review.createdAt
                                                ).toLocaleDateString()
                                                : 'Date unavailable'}
                                        </span>

                                    </div>

                                    <div className="admin-review-content">
                                        <p>
                                            {review.reviewText ||
                                                'No review text provided.'}
                                        </p>
                                    </div>

                                    <div className="admin-review-footer">

                                        <span className="admin-review-movie-id">
                                            Movie ID: {review.movieId}
                                        </span>

                                        <button
                                            type="button"
                                            className="admin-action-btn delete-btn"
                                            onClick={() =>
                                                handleDeleteReview(review)
                                            }
                                            disabled={
                                                actionLoading ===
                                                `delete-review-${review.id}`
                                            }
                                        >
                                            {actionLoading ===
                                            `delete-review-${review.id}` ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                <i className="fas fa-trash"></i>
                                            )}

                                            Delete Review
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>

            </div>
        </section>
    )
}

export default AdminDashboard