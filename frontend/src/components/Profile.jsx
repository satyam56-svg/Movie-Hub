import { useEffect, useState } from 'react'
import API_BASE_URL from '../api/config'
import { authFetch } from '../api/authFetch'

function Profile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('Please login to view your profile.')
                setLoading(false)
                return
            }

            try {
                const response = await authFetch(
                    `${API_BASE_URL}/api/users/profile`
                )

                if (!response.ok) {
                    throw new Error('Failed to load profile')
                }

                const data = await response.json()
                setProfile(data)
            } catch (error) {
                console.error('Profile fetch error:', error)
                setError('Unable to load profile.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    if (loading) {
        return (
            <section id="profile" className="section">
                <div className="container">
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading profile details...</span>
                    </div>
                </div>
            </section>
        )
    }

    if (error || !profile) {
        return (
            <section id="profile" className="section">
                <div className="container">
                    <div className="loading">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error || 'Profile unavailable'}</span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="profile" className="section profile-section">
            <div className="container">
                <h2 className="section-title">My Profile</h2>

                <div className="profile-card">
                    <div className="profile-avatar">
                        <i className="fas fa-user-circle"></i>
                    </div>

                    <div className="profile-info">
                        <div className="profile-item">
                            <span className="profile-label">Username</span>
                            <span className="profile-value">{profile.username}</span>
                        </div>

                        <div className="profile-item">
                            <span className="profile-label">Email Address</span>
                            <span className="profile-value">{profile.email}</span>
                        </div>

                        <div className="profile-item">
                            <span className="profile-label">Account Role</span>
                            <span className="profile-value profile-role">
                                {profile.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Profile