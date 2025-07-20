import React from "react";
import { useScrollToTop } from "../hooks/useScrollToTop";

/**
 * ScrollToTop component - automatically scrolls to top on route change
 * This component should be placed inside the Router but outside of Routes
 * It doesn't render anything visible, just handles the scroll behavior
 */
const ScrollToTop: React.FC = () => {
  useScrollToTop();
  return null; // This component doesn't render anything
};

export default ScrollToTop;
