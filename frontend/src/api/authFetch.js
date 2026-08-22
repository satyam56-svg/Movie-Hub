/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Bearer token from localStorage.
 * On 401 or 403, clears the stale session and dispatches a
 * 'session-expired' event so App.jsx can force logout.
 */
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token')

    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401 || response.status === 403) {
        // Token is stale (server restarted and wiped DB, or token expired).
        // Clear everything and fire an event so App.jsx can re-render.
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        window.dispatchEvent(new Event('session-expired'))
    }

    return response
}
