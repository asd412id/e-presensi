import React from "react";

import Notification from "./Notification";

interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    isVisible: boolean;
  }>;
  onRemoveNotification: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemoveNotification,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          isVisible={notification.isVisible}
          message={notification.message}
          title={notification.title}
          type={notification.type}
          onClose={() => onRemoveNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
