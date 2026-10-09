/**
 * Formats a movie poster URL.
 * If posterUrl starts with '/', appends TMDB image base URL.
 * Returns null if posterUrl is missing or invalid.
 */
export function getPosterUrl(posterUrl) {
    if (!posterUrl || typeof posterUrl !== 'string') {
        return null
    }

    const trimmed = posterUrl.trim()
    if (!trimmed) {
        return null
    }

    if (trimmed.startsWith('/')) {
        return `https://image.tmdb.org/t/p/w500${trimmed}`
    }

    return trimmed
}
