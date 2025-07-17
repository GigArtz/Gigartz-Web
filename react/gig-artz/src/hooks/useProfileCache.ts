import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, fetchAllProfiles } from '../../store/profileSlice';

interface UseProfileCacheOptions {
    userId?: string;
    autoFetch?: boolean;
    cacheTimeout?: number; // in milliseconds
}

export const useProfileCache = (options: UseProfileCacheOptions = {}) => {
    const { userId, autoFetch = true, cacheTimeout = 5 * 60 * 1000 } = options; // 5 minutes default
    const dispatch = useDispatch<AppDispatch>();
    const { userProfile, userList, loading, error } = useSelector((state: RootState) => state.profile);
    const currentUserId = useSelector((state: RootState) => state.auth.user?.uid);

    const lastFetchTime = useRef<number>(0);
    const lastUserListFetchTime = useRef<number>(0);

    // Determine which user ID to use
    const targetUserId = userId || currentUserId;

    // Check if cache is still valid
    const isCacheValid = useCallback((lastFetch: number) => {
        return Date.now() - lastFetch < cacheTimeout;
    }, [cacheTimeout]);

    // Fetch user profile with cache validation
    const fetchProfile = useCallback((forceRefresh = false) => {
        if (!targetUserId) return;

        if (!forceRefresh && isCacheValid(lastFetchTime.current) && userProfile?.id === targetUserId) {
            return; // Use cached data
        }

        dispatch(fetchUserProfile(targetUserId));
        lastFetchTime.current = Date.now();
    }, [targetUserId, dispatch, userProfile?.id]);

    // Fetch all profiles with cache validation
    const fetchProfiles = useCallback((forceRefresh = false) => {
        if (!forceRefresh && isCacheValid(lastUserListFetchTime.current) && userList?.length > 0) {
            return; // Use cached data
        }

        dispatch(fetchAllProfiles());
        lastUserListFetchTime.current = Date.now();
    }, [dispatch, userList?.length]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch && targetUserId) {
            fetchProfile();
        }
    }, [targetUserId, autoFetch]);

    return {
        userProfile,
        userList,
        loading,
        error,
        fetchProfile,
        fetchProfiles,
        isProfileCached: isCacheValid(lastFetchTime.current),
        isUserListCached: isCacheValid(lastUserListFetchTime.current),
    };
};

export default useProfileCache;
