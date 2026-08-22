import { useEffect, useState } from 'react'

/**
 * Custom hook to debounce a value by a specified delay in milliseconds.
 * @param {*} value The value to debounce.
 * @param {number} delay The delay in milliseconds (default 300ms).
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default useDebounce
