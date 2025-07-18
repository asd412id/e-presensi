import { useState, useCallback } from "react";

interface NotificationState {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  isVisible: boolean;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = useCallback(
    (
      type: "success" | "error" | "info" | "warning",
      title: string,
      message: string,
      duration: number = 5000,
    ) => {
      const id = Date.now().toString();
      const newNotification: NotificationState = {
        id,
        type,
        title,
        message,
        isVisible: true,
      };

      setNotifications((prev) => [...prev, newNotification]);

      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showNotification("success", title, message);
    },
    [showNotification],
  );

  const showError = useCallback(
    (title: string, message: string) => {
      showNotification("error", title, message);
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      showNotification("info", title, message);
    },
    [showNotification],
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      showNotification("warning", title, message);
    },
    [showNotification],
  );

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
  };
};
