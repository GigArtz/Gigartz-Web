import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to debounce state updates and prevent excessive re-renders
 * Particularly useful for auth state that changes frequently
 */
export const useDebounceValue = <T>(value: T, delay: number = 100): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounceValue;
