import type { Middleware } from "@reduxjs/toolkit";
import { socketService } from "@/services/socket/socket.service";
import { notificationApi } from "@/services/notification/notification.service";
import type { INotification } from "@/types/notification";
import { toast } from "sonner";

export const socketMiddleware: Middleware = (storeAPI) => {
  let isSocketInitialized = false;

  return (next) => (action: any) => { 
    // console.log("Action received:", action.type);
    // Khi user login thành công
    if (action.type === "auth/setLogin" && !isSocketInitialized) {
      const token = action.payload?.accessToken;
        console.log("token", token);
      if (token) {
        console.log("🔌 Initializing socket connection...");
        const socket = socketService.connect(token);
        isSocketInitialized = true;

        // ============ LẮNG NGHE EVENT: NEW NOTIFICATION ============
        socket.on("new-notification", (notification: INotification) => {
          console.log("📬 New notification:", notification);

          try {
            // Tự động thêm vào cache
            storeAPI.dispatch(
              notificationApi.util.updateQueryData(
                "getMyNotifications",
                undefined,
                (draft: any) => {
                  if (draft?.data && Array.isArray(draft.data)) {
                    draft.data.unshift(notification);
                  }
                }
              ) as any 
            );

            // Hiển thị toast
            toast.info(notification.title, {
              description: notification.content,
              duration: 5000,
            });
          } catch (error) {
            console.error("Error updating notification cache:", error);
          }
        });

        // ============ LẮNG NGHE EVENT: NOTIFICATION READ ============
        socket.on(
          "notification-read",
          (data: { notificationId: string; userId: string }) => {
            console.log("✓ Notification read:", data);
            try {
              storeAPI.dispatch(
                notificationApi.util.invalidateTags(["Notifications"]) as any
              );
            } catch (error) {
              console.error("Error invalidating tags:", error);
            }
          }
        );

        // ============ LẮNG NGHE EVENT: NOTIFICATION DELETED ============
        socket.on("notification-deleted", (data: { notificationId: string }) => {
          console.log("🗑️ Notification deleted:", data);

          try {
            storeAPI.dispatch(
              notificationApi.util.updateQueryData(
                "getMyNotifications",
                undefined,
                (draft: any) => {
                  if (draft?.data && Array.isArray(draft.data)) {
                    draft.data = draft.data.filter(
                      (n: INotification) => n._id !== data.notificationId
                    );
                  }
                }
              ) as any
            );
          } catch (error) {
            console.error("Error removing notification from cache:", error);
          }
        });

        // ============ SOCKET CONNECTION EVENTS ============
        socket.on("connect", () => {
          console.log("✅ Socket connected successfully, ID:", socket.id);
          try {
            storeAPI.dispatch(
              notificationApi.util.invalidateTags(["Notifications"]) as any
            );
          } catch (error) {
            console.error("Error invalidating tags on connect:", error);
          }
        });

        socket.on("disconnect", (reason: string) => {
          console.log("❌ Socket disconnected:", reason);
          if (reason === "io server disconnect") {
            toast.error("Phiên đăng nhập hết hạn", {
              description: "Vui lòng đăng nhập lại",
            });
          }
        });

        socket.on("connect_error", (error: Error) => {
          console.error("❌ Socket connection error:", error.message);
          toast.error("Mất kết nối real-time", {
            description: "Đang thử kết nối lại...",
          });
        });
      }
    }

    // ============ KHI USER LOGOUT ============
    if (action.type === "auth/setLogout" || action.type === "persist/PURGE") {
      if (isSocketInitialized) {
        console.log("🔌 Disconnecting socket...");
        socketService.disconnect();
        isSocketInitialized = false;
      }
    }

    return next(action);
  };
};