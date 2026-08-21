/**
 * Central API base URL configuration.
 * Set VITE_API_BASE_URL in your .env file for production.
 * Falls back to localhost:8080 for local development.
 */
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080';

export default API_BASE_URL;
