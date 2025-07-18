import React, { useEffect, useState } from "react";
import {
  IconX,
  IconCheck,
  IconExclamationCircle,
  IconInfoCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setProgress(100);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 100);

          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    } else {
      setProgress(100);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <IconCheck className="text-green-600 dark:text-green-400" size={20} />
        );
      case "error":
        return (
          <IconExclamationCircle
            className="text-red-600 dark:text-red-400"
            size={20}
          />
        );
      case "warning":
        return (
          <IconAlertTriangle
            className="text-orange-600 dark:text-orange-400"
            size={20}
          />
        );
      case "info":
        return (
          <IconInfoCircle
            className="text-violet-600 dark:text-violet-400"
            size={20}
          />
        );
      default:
        return (
          <IconInfoCircle
            className="text-violet-600 dark:text-violet-400"
            size={20}
          />
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200/50 dark:border-green-700/50";
      case "error":
        return "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-200/50 dark:border-red-700/50";
      case "warning":
        return "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200/50 dark:border-orange-700/50";
      case "info":
        return "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-200/50 dark:border-violet-700/50";
      default:
        return "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-200/50 dark:border-violet-700/50";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`transform transition-all duration-500 ease-in-out ${isAnimating
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
        }`}
    >
      <div
        className={`min-w-80 max-w-md w-full shadow-2xl rounded-2xl border-2 backdrop-blur-xl ${getBackgroundColor()}`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 shadow-lg border border-white/50 dark:border-zinc-700/50">
                {getIcon()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                {title}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                className="group p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 border border-transparent hover:border-white/50 dark:hover:border-zinc-700/50"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <IconX
                  className="transition-transform group-hover:scale-110"
                  size={16}
                />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-white/30 dark:bg-zinc-800/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-linear rounded-full ${type === "success"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : type === "error"
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : type === "warning"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500"
                      : "bg-gradient-to-r from-violet-500 to-purple-500"
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
