// src/middleware/socket.middleware.ts

import type { Middleware } from "@reduxjs/toolkit";
import { socketService } from "@/services/socket/socket.service";
import { notificationApi } from "@/services/notification/notification.service";
import type { RootState } from "@/store/store";
import { toast } from "sonner";

declare global {
  interface Window {
    __SOCKET_LISTENERS_ATTACHED__?: boolean;
  }
}

const attachSocketListeners = (storeAPI: any) => {
  if (window.__SOCKET_LISTENERS_ATTACHED__) return;
  window.__SOCKET_LISTENERS_ATTACHED__ = true;

  const socket = socketService.getSocket();
  if (!socket) return;

  // Nhận thông báo mới
  socket.on("new_notification", (notification: any) => {
    const state: RootState = storeAPI.getState();
    const role = state.auth.role || state.auth.userInfo?.role;

    const endpointName =
      role === "resident" ? "getMyNotificationsResident" : "getMyNotifications";

    // Cập nhật cache RTK Query
    storeAPI.dispatch(
      notificationApi.util.updateQueryData(endpointName as any, undefined, (draft: any) => {
        if (draft?.data) {
          draft.data.unshift(notification);
          draft.pagination.total += 1;
        }
      })
    );

    const getShortDescription = (content: string) => {
    const plain = content.replace(/<[^>]*>/g, "").trim();
    return plain.length > 80
      ? plain.substring(0, 77) + "..."
      : plain;
  };

    toast.info(notification.title || "Bạn có thông báo mới", {
      description: getShortDescription(notification.content),
      duration: 8000,
      ...(state.auth.role !== "resident" 
        ? {
            action: {
              label: "Xem ngay",
              onClick: () => {
                window.location.href = notification.link ;
              },
            },
          }
        : {}),
    });
  });

  // Tăng số thông báo chưa đọc 
  socket.on("unread_count_increment", ({ increment = 1 }: { increment?: number }) => {
    const state: RootState = storeAPI.getState();
    const role = state.auth.role || state.auth.userInfo?.role;
    const endpointName =
      role === "resident" ? "getMyNotificationsResident" : "getMyNotifications";

    storeAPI.dispatch(
      notificationApi.util.updateQueryData(endpointName as any, undefined, (draft: any) => {
        if (draft?.data && draft.data[0]) {
          draft.data[0].isRead = false; // đánh dấu cái mới nhất là chưa đọc
        }
      })
    );
  });

  // Thông báo bị sửa
  socket.on("notification_updated", (payload: any) => {
    const state: RootState = storeAPI.getState();
    const role = state.auth.role || state.auth.userInfo?.role;
    const endpointName =
      role === "resident" ? "getMyNotificationsResident" : "getMyNotifications";

    storeAPI.dispatch(
      notificationApi.util.updateQueryData(endpointName as any, undefined, (draft: any) => {
        const noti = draft?.data?.find((n: any) => n._id === payload.id || n.id === payload.id);
        if (noti) {
          Object.assign(noti, payload);
        }
      })
    );

    toast.success("Một thông báo đã được cập nhật");
  });

  // Log trạng thái kết nối
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    window.__SOCKET_LISTENERS_ATTACHED__ = false; // cho phép gắn lại khi reconnect
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
    toast.error("Mất kết nối real-time", {
      description: "Đang thử kết nối lại...",
      duration: 5000,
    });
  });
};

const detachSocketListeners = () => {
  const socket = socketService.getSocket();
  if (!socket) return;

  socket.off("new_notification");
  socket.off("unread_count_increment");
  socket.off("notification_updated");
  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");

  window.__SOCKET_LISTENERS_ATTACHED__ = false;
  console.log("Socket listeners removed");
};

export const socketMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const state: RootState = storeAPI.getState();
  const token = state.auth.accessToken;

  if (token && !socketService.isConnected()) {
    socketService.connect(token);
    attachSocketListeners(storeAPI);
  }

  if (action.type === "auth/setLogin" && action.payload?.accessToken) {
    socketService.connect(action.payload.accessToken);
    attachSocketListeners(storeAPI);
  }

  if (action.type === "auth/setLogout" ) {
    detachSocketListeners();
    socketService.disconnect();
  }

  return next(action);
};