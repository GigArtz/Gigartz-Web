/**
 * Utility functions for scroll management across the application
 */

/**
 * Smoothly scroll to the top of the page
 * @param behavior - 'smooth' for animated scroll, 'auto' for instant
 */
export const scrollToTop = (behavior: ScrollBehavior = 'auto'): void => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior
    });
};

/**
 * Scroll to a specific element by ID
 * @param elementId - The ID of the element to scroll to
 * @param behavior - 'smooth' for animated scroll, 'auto' for instant
 * @param offset - Optional offset from the top (useful for sticky headers)
 */
export const scrollToElement = (
    elementId: string,
    behavior: ScrollBehavior = 'smooth',
    offset: number = 0
): void => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - offset,
            left: 0,
            behavior
        });
    }
};

/**
 * Check if user has scrolled past a certain threshold
 * @param threshold - The scroll threshold in pixels
 * @returns boolean indicating if scrolled past threshold
 */
export const hasScrolledPast = (threshold: number = 100): boolean => {
    return window.scrollY > threshold;
};

/**
 * Get current scroll position
 * @returns object with x and y scroll positions
 */
export const getScrollPosition = (): { x: number; y: number } => {
    return {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset
    };
};

export default {
    scrollToTop,
    scrollToElement,
    hasScrolledPast,
    getScrollPosition
};
