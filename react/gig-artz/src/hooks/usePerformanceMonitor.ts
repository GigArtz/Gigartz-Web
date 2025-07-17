import { useEffect, useRef } from 'react';

/**
 * Development hook to monitor component re-renders
 * Helps identify performance issues in development
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRenderLogger = (componentName: string, props?: Record<string, any>) => {
    const renderCount = useRef(0);
    const prevProps = useRef(props);

    useEffect(() => {
        renderCount.current += 1;

        if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 ${componentName} render #${renderCount.current}`);

            // Log prop changes if props are provided
            if (props && prevProps.current) {
                const changedProps = Object.keys(props).filter(
                    key => props[key] !== prevProps.current?.[key]
                );

                if (changedProps.length > 0) {
                    console.log(`📝 ${componentName} prop changes:`, changedProps);
                }
            }

            prevProps.current = props;
        }
    });

    return renderCount.current;
};

/**
 * Hook to measure component render performance
 */
export const useRenderTiming = (componentName: string) => {
    const startTime = useRef<number>();
    const renderCount = useRef(0);

    // Mark start of render
    startTime.current = performance.now();

    useEffect(() => {
        if (startTime.current && process.env.NODE_ENV === 'development') {
            const renderTime = performance.now() - startTime.current;
            renderCount.current += 1;

            if (renderTime > 16) { // Flag renders longer than 16ms (60fps)
                console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
            }
        }
    });
};

export default { useRenderLogger, useRenderTiming };
