import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";

import type {
  ICreateNotificationRequest,
  ICreateNotificationResponse,
  IUpdateNotificationResponse,
  IDeleteNotificationResponse,
  IGetMyNotificationsResponse,
  IGetNotificationByIdResponse,
  IMarkAsReadResponse,
  INotification,
} from "@/types/notification";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notifications", "NotificationDetail"],
  endpoints: (builder) => ({
    // POST /landlords/notifications - Tạo thông báo mới
    createNotification: builder.mutation<
      ICreateNotificationResponse,
      FormData
    >({
      query: (formData) => ({
        url: "/landlords/notifications",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': undefined,
        },
      }),
      invalidatesTags: ["Notifications"],
    }),

    // PATCH /landlords/notifications/{id} - Cập nhật thông báo
    updateNotification: builder.mutation<
      IUpdateNotificationResponse,
      { id: string; data: FormData | Partial<ICreateNotificationRequest> }
    >({
      query: ({ id, data }) => {
        const isFormData = data instanceof FormData;
        return {
          url: `/landlords/notifications/${id}`,
          method: "PATCH",
          data,
          headers: isFormData ? { 'Content-Type': undefined } : {},
        };
      },
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
      providesTags: (_result, _error, id) => [
        { type: "NotificationDetail", id },
      ],
    }),

    // GET /landlords/notifications/me - Lấy danh sách thông báo của tôi nhận được
    getMyNotifications: builder.query<IGetMyNotificationsResponse, void>({
      query: () => ({
        url: "/landlords/notifications/me",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    
    // Lấy các thông báo mà tôi đã gửi 
    getSentNotifications: builder.query<IGetMyNotificationsResponse, void>({
      query: () => ({
        url: "/landlords/notifications/my-sent",
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
              const notification = draft.data.find(
                (n) => n._id === notificationId
              );
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

   getMyNotificationsResident: builder.query<IGetMyNotificationsResponse, void>({
      query: () => ({
        url: "/notifications/me",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),

    // POST /notifications/read - Đánh dấu đã đọc (Resident)
    markNotificationAsReadResident: builder.mutation<IMarkAsReadResponse, string[]>({
      query: (notificationIds) => ({
        url: "/notifications/read",
        method: "POST",
        data: { notificationIds },
      }),
      invalidatesTags: ["Notifications"],
    }),

    // GET /notifications/{id} - Lấy chi tiết thông báo (chung - Resident cũng dùng được)
     getNotificationByIdResident: builder.query<IGetNotificationByIdResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "NotificationDetail", id },
      ],
    }),

     getUnreadNotificationsResident: builder.query<{sucess: boolean;  unreadCount: number}, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useGetMyNotificationsQuery,
  useGetSentNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationByIdQuery,
  useLazyGetNotificationByIdQuery,
  useLazyGetMyNotificationsQuery,
  useGetMyNotificationsResidentQuery,
  useMarkNotificationAsReadResidentMutation,
  useGetNotificationByIdResidentQuery,
  useGetUnreadNotificationsResidentQuery,
} = notificationApi;