import { useMemo } from "react";
import {
  useGetMyNotificationsQuery,
  useGetMyNotificationsResidentQuery,
  useMarkNotificationAsReadResidentMutation,
  useDeleteNotificationMutation,
  useMarkNotificationAsReadMutation,
} from "@/services/notification/notification.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export const useNotifications = () => {
  const currentUserId = useSelector((state: RootState) => state.auth?.userInfo?._id);
  const currentRole = useSelector((state: RootState) => state.auth.role || state.auth.userInfo?.role);

  const landlordQuery = useGetMyNotificationsQuery(
    currentRole === "landlord" || currentRole === "staff" ? undefined : skipToken
  );

  const residentQuery = useGetMyNotificationsResidentQuery(
    currentRole === "resident" ? undefined : skipToken
  );

  const queryResult = currentRole === "resident" ? residentQuery : landlordQuery;
  const { data: response, isLoading, isFetching, refetch, error } = queryResult;

  const [markAsReadResident] = useMarkNotificationAsReadResidentMutation();
  const [markAsReadLandlord] = useMarkNotificationAsReadMutation();

  const notifications = response?.data?.filter(n => !n.isDeleted) || [];

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => {
      if (currentRole === "resident") {
        return !n.isRead;
      }
      
      return !n.readBy?.some((r: any) => r.accountId === currentUserId);
    }).length;
  }, [notifications, currentRole, currentUserId]);

  const unreadNotifications = notifications.filter((n) => {
    if (currentRole === "resident") return !n.isRead;
    return !n.readBy?.some((r: any) => r.accountId === currentUserId);
  });

  const readNotifications = notifications.filter((n) => {
    if (currentRole === "resident") return n.isRead;
    return n.readBy?.some((r: any) => r.accountId === currentUserId);
  });

  const handleMarkAsRead = async (notificationId: string) => {
    if (!currentRole) return;
    try {
      if (currentRole === "resident") {
        await markAsReadResident([notificationId]).unwrap();
      } else if (currentRole === "landlord" || currentRole === "staff") {
        await markAsReadLandlord([notificationId]).unwrap();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const isNotificationRead = (notificationId: string) => {
    const noti = notifications.find(n => n._id === notificationId);
    if (!noti) return true;

    if (currentRole === "resident") return noti.isRead;
    return noti.readBy?.some((r: any) => r.accountId === currentUserId) || false;
  };

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    total: notifications.length,
    currentUserId,
    currentRole,
    isLoading: isLoading || isFetching,
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0,
    error,

    markAsRead: handleMarkAsRead,
    refetch,
    isNotificationRead,
  };
};

export const useUnreadCount = () => {
  const { unreadCount, isLoading } = useNotifications();
  return { unreadCount, isLoading };
};