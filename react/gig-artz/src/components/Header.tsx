import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  renderRight?: () => React.ReactNode;
}

function Header({
  title,
  onBack,
  showBackButton = true,
  renderRight,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default behavior: go back in browser history
      navigate(-1);
    }
  };

  return (
    <div className="sticky hidden sm:block top-0 pt-1 mb-2 z-10 bg-dark backdrop-blur-lg border-b border-gray-800">
      <div className="group hidden mt-2 sm:block md:flex items-center mb-6 p-4 gap-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-teal-500/10 hover:border-teal-500/30 sticky top-1 z-10 bg-gray-950/95 border-b border-gray-800">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="group/btn relative p-3 bg-gray-700/50 hover:bg-teal-500/20 border border-gray-600 hover:border-teal-400/50 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 active:scale-95 overflow-hidden"
            aria-label="Go back"
          >
            {/* Button background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-400/0 group-hover/btn:from-teal-500/20 group-hover/btn:to-teal-400/10 transition-all duration-300 rounded-xl"></div>
            {/* Icon with enhanced animations */}
            <FaArrowLeft className="relative z-10 w-4 h-4 text-gray-300 group-hover/btn:text-teal-300 transition-all duration-300 group-hover/btn:translate-x-[-1px]" />
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent transform translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        )}
        {/* Enhanced title with gradient text and animation */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-300 via-white to-teal-300 bg-clip-text text-transparent truncate transition-all duration-300 group-hover:from-teal-200 group-hover:via-teal-100 group-hover:to-teal-200">
            {title}
          </h1>
          {/* Subtle underline animation */}
          <div className="h-0.5 w-0 bg-gradient-to-r from-teal-400 to-teal-300 rounded-full transition-all duration-500 group-hover:w-full mt-1"></div>
        </div>
        {/* Optional custom right-side content */}
        {renderRight && (
          <div className="flex-shrink-0 ml-2">{renderRight()}</div>
        )}
        {/* Optional decorative element */}
        <div className="hidden lg:block">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-teal-400/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-teal-400/60 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-teal-400/80 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
