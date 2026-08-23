/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Bearer token from localStorage.
 * On 401, clears the stale session and dispatches a
 * 'session-expired' event so App.jsx can force logout.
 */
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token')

    const headers = {
        ...(options.headers || {}),
        ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    // 401 = token is invalid/expired
    if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')

        window.dispatchEvent(
            new Event('session-expired')
        )
    }

    return response
}