import { useMemo } from "react";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "@/services/notification/notification.service";
import { socketService } from "@/services/socket/socket.service";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export const useNotifications = () => {
  const currentUserId = useSelector(
    (state: RootState) => state.auth?.userInfo?._id
  );
  const currentRole = useSelector(
    (state: RootState) => state.auth.role || state.auth.userInfo?.role
  );

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetMyNotificationsQuery();

  const [markAsRead, { isLoading: isMarkingAsRead }] = 
    useMarkNotificationAsReadMutation();
  
  const [deleteNotification, { isLoading: isDeletingNotification }] = 
    useDeleteNotificationMutation();

  const notifications = response?.data || [];

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const isSocketConnected = socketService.isConnected();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const isNotificationRead = (notificationId: string) => {
    const notification = notifications.find(n => n._id === notificationId);
    if (!notification || !currentUserId) return false;
    
    return notification.readBy?.some(r => r.residentId === currentUserId) || false;
  };

  return {
    // Data
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    total: notifications.length,
    currentUserId,
    currentRole,

    // States
    isLoading,
    isMarkingAsRead,
    isDeletingNotification,
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0,
    isSocketConnected,

    // Actions
    markAsRead: handleMarkAsRead,
    deleteNotification: handleDelete,
    refetch,
    
    // Utilities
    isNotificationRead,
  };
};

// Hook riêng cho unread count (dùng cho navbar)
export const useUnreadCount = () => {
  const { unreadCount, isLoading, refetch } = useNotifications();

  return {
    unreadCount,
    isLoading,
    refetch,
  };
};