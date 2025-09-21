import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AuthRedirectProps {
  publicRoutes?: string[];
  defaultAuthenticatedRoute?: string;
  defaultUnauthenticatedRoute?: string;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({
  publicRoutes = ["/", "/register", "/forgot", "/terms"],
  defaultAuthenticatedRoute = "/home",
  defaultUnauthenticatedRoute = "/",
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const fromPathname = location.state?.from?.pathname;

  // Memoize the public route check to prevent unnecessary computations
  const isPublicRoute = useMemo(() => {
    return publicRoutes.includes(currentPath);
  }, [publicRoutes, currentPath]);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If user is authenticated and on a public route, redirect to authenticated area
    if (isAuthenticated && isPublicRoute) {
      // Check if there's a saved redirect location
      const redirectTo =
        fromPathname && fromPathname !== currentPath
          ? fromPathname
          : defaultAuthenticatedRoute;
      navigate(redirectTo, { replace: true });
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      navigate(defaultUnauthenticatedRoute, {
        replace: true,
        state: { from: location },
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    currentPath,
    fromPathname,
    isPublicRoute,
    navigate,
    defaultAuthenticatedRoute,
    defaultUnauthenticatedRoute,
    location, // Keep location for the state object in navigate
  ]);

  return null;
};

export default AuthRedirect;
