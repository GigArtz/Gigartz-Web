import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { clearToast } from "../../store/notificationSlice";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

interface GlobalNotificationProps {
  position?:
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";
}

const GlobalNotification: React.FC<GlobalNotificationProps> = ({
  position = "top-right",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useSelector((state: RootState) => state.notification);
  const [localToast, setLocalToast] = useState<typeof toast>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toast) {
      // Only proceed if this is a new toast (different ID) or we have no current toast
      const isNewToast = !localToast || toast.id !== localToast.id;

      if (isNewToast) {
        setLocalToast(toast);
        setIsVisible(true);

        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Auto-dismiss after 5 seconds
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setLocalToast(null);
            dispatch(clearToast());
          }, 300); // Wait for fade out animation
        }, 5000);
      }
    }
  }, [toast, dispatch, localToast]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!localToast) {
    return null;
  }

  const getPositionStyles = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  const getTypeStyles = () => {
    switch (localToast?.type) {
      case "success":
        return {
          bgColor: "bg-gradient-to-r from-green-500/90 to-green-600/90",
          borderColor: "border-green-400",
          icon: <FaCheckCircle className="w-5 h-5 text-green-200" />,
          textColor: "text-white",
        };
      case "error":
        return {
          bgColor: "bg-gradient-to-r from-red-500/90 to-red-600/90",
          borderColor: "border-red-400",
          icon: <FaExclamationTriangle className="w-5 h-5 text-red-200" />,
          textColor: "text-white",
        };
      case "warning":
        return {
          bgColor: "bg-gradient-to-r from-orange-500/90 to-orange-600/90",
          borderColor: "border-orange-400",
          icon: <FaExclamationTriangle className="w-5 h-5 text-orange-200" />,
          textColor: "text-white",
        };
      case "info":
      default:
        return {
          bgColor: "bg-gradient-to-r from-blue-500/90 to-blue-600/90",
          borderColor: "border-blue-400",
          icon: <FaInfoCircle className="w-5 h-5 text-blue-200" />,
          textColor: "text-white",
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setLocalToast(null);
      dispatch(clearToast());
    }, 300);
  };

  const handleActionClick = () => {
    if (localToast?.action?.onClick) {
      // Execute the action string as a function call
      try {
        eval(localToast.action.onClick);
      } catch (error) {
        console.error("Error executing toast action:", error);
      }
    }
    handleClose();
  };

  return (
    <div
      className={`fixed ${getPositionStyles()} transition-all duration-300 ${
        isVisible
          ? "opacity-100 transform translate-x-0 scale-100"
          : "opacity-0 transform translate-x-full scale-95"
      }`}
      style={{ zIndex: 999999 }}
    >
      <div
        className={`
          ${typeStyles.bgColor} ${typeStyles.borderColor} 
          backdrop-blur-sm border-2 rounded-2xl shadow-2xl 
          p-4 min-w-[320px] max-w-md
          transform transition-all duration-300 ease-out
          hover:scale-[1.02] hover:shadow-3xl
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{typeStyles.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${typeStyles.textColor} leading-relaxed`}
            >
              {localToast.message}
            </p>

            {/* Action Button */}
            {localToast.action && (
              <button
                onClick={handleActionClick}
                className="mt-2 text-xs font-semibold underline hover:no-underline transition-all duration-200 opacity-90 hover:opacity-100"
              >
                {localToast.action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group"
            aria-label="Close notification"
          >
            <FaTimes className="w-4 h-4 text-white/80 group-hover:text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full animate-progress-bar"
            style={{
              animation: "progress-bar 5s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalNotification;
