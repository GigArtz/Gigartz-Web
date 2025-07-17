import { useRef, useEffect, DependencyList } from 'react';

/**
 * Custom hook to throttle function calls and prevent excessive execution
 * Particularly useful for API calls triggered by state changes
 */
export const useApiThrottle = (
    callback: () => void,
    delay: number = 1000,
    dependencies: DependencyList = []
) => {
    const lastCallTime = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime.current;

        if (timeSinceLastCall >= delay) {
            // Execute immediately if enough time has passed
            lastCallTime.current = now;
            callback();
        } else {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Schedule execution after the remaining delay
            timeoutRef.current = setTimeout(() => {
                lastCallTime.current = Date.now();
                callback();
            }, delay - timeSinceLastCall);
        }

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callback, delay, ...dependencies]);
};

export default useApiThrottle;
