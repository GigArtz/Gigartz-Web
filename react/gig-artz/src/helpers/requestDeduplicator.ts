/**
 * Request deduplication utility to prevent multiple identical API calls
 */

interface PendingRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promise: Promise<any>;
    timestamp: number;
}

class RequestDeduplicator {
    private pendingRequests = new Map<string, PendingRequest>();
    private readonly CACHE_DURATION = 5000; // 5 seconds

    /**
     * Execute a request with deduplication
     * @param key - Unique key for the request
     * @param requestFn - Function that returns a promise
     * @returns Promise that resolves to the request result
     */
    async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
        const now = Date.now();
        const existing = this.pendingRequests.get(key);

        // Check if there's a recent pending request
        if (existing && (now - existing.timestamp) < this.CACHE_DURATION) {
            return existing.promise;
        }

        // Create new request
        const promise = requestFn().finally(() => {
            // Clean up after request completes
            setTimeout(() => {
                this.pendingRequests.delete(key);
            }, 1000);
        });

        this.pendingRequests.set(key, {
            promise,
            timestamp: now
        });

        return promise;
    }

    /**
     * Clear a specific request from the cache
     * @param key - Request key to clear
     */
    clear(key: string): void {
        this.pendingRequests.delete(key);
    }

    /**
     * Clear all pending requests
     */
    clearAll(): void {
        this.pendingRequests.clear();
    }

    /**
     * Get the number of pending requests
     */
    getPendingCount(): number {
        return this.pendingRequests.size;
    }
}

// Create a singleton instance
export const requestDeduplicator = new RequestDeduplicator();

export default RequestDeduplicator;
