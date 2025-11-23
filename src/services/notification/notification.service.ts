import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";

import type {
  ICreateNotificationRequest,
  ICreateNotificationResponse,
  IUpdateNotificationResponse,
  IDeleteNotificationResponse,
  IGetMyNotificationsResponse,
  IGetNotificationByIdResponse, IMarkAsReadResponse, INotification
} from "@/types/notification";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notifications", "NotificationDetail"],
  endpoints: (builder) => ({
    // POST /landlords/notifications - Tạo thông báo mới
    createNotification: builder.mutation<
      ICreateNotificationResponse,
      ICreateNotificationRequest
    >({
      query: (data) => ({
        url: "/landlords/notifications",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // PATCH /landlords/notifications/{id} - Cập nhật thông báo
    updateNotification: builder.mutation<
      IUpdateNotificationResponse,
      { id: string; data: Partial<ICreateNotificationRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/notifications/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Notifications",
        { type: "NotificationDetail", id },
      ],
    }),

    // DELETE /landlords/notifications/{id} - Xóa thông báo
    deleteNotification: builder.mutation<IDeleteNotificationResponse, string>({
      query: (id) => ({
        url: `/landlords/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // GET /landlords/notifications/{id} - Lấy chi tiết 1 thông báo
    getNotificationById: builder.query<IGetNotificationByIdResponse, string>({
      query: (id) => ({
        url: `/landlords/notifications/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "NotificationDetail", id }],
    }),

    // GET /landlords/notifications/me - Lấy danh sách thông báo của tôi
    getMyNotifications: builder.query<IGetMyNotificationsResponse, void>({
      query: () => ({
        url: "/landlords/notifications/me",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),

    // POST /landlords/notifications/read - Đánh dấu thông báo đã đọc (chỉ tenant)
    markNotificationAsRead: builder.mutation<IMarkAsReadResponse, string>({
      query: (notificationId) => ({
        url: "/landlords/notifications/read",
        method: "POST",
        data: { notificationId },
      }),
      // Optimistic update
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            "getMyNotifications",
            undefined,
            (draft) => {
              const notification = draft.data.find((n) => n._id === notificationId);
              if (notification) {
                if (!notification.readBy) {
                  notification.readBy = [];
                }
                // Thêm vào readBy (giả sử backend trả về đầy đủ)
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationByIdQuery,
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useLazyGetNotificationByIdQuery,
  useLazyGetMyNotificationsQuery,
} = notificationApi;