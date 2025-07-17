import { useRef, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Custom hook for throttling function calls
 * @param callback - The function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export const useThrottle = <T extends AnyFunction>(
    callback: T,
    delay: number
): T => {
    const lastCall = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastCall.current >= delay) {
                lastCall.current = now;
                return callback(...args);
            } else {
                // Clear existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Set new timeout for trailing call
                timeoutRef.current = setTimeout(() => {
                    lastCall.current = Date.now();
                    callback(...args);
                }, delay - (now - lastCall.current));
            }
        },
        [callback, delay]
    ) as T;

    return throttledCallback;
};

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const useDebounce = <T extends AnyFunction>(
    callback: T,
    delay: number
): T => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    ) as T;

    return debouncedCallback;
};

export default { useThrottle, useDebounce };
