import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  ICreateUtilityBulkRequest,
  IUpdateReadingRequest,
  IUtilityDetailResponse,
  IUtilityListResponse,
  IUtilityReadingRequest,
  IUtilityRoomListResponse,
} from "@/types/utility";

export const utilityApi = createApi({
  reducerPath: "utilityApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["UtilityReading", "UtilityReadingRoom"],
  endpoints: (builder) => ({
    getUtilityReadingsRoom: builder.query<
      // Lấy danh sách phòng để nhập chỉ số điện nước theo kỳ
      IUtilityRoomListResponse,
      {
        buildingId?: string;
        periodMonth?: string;
        periodYear?: string;
        p?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({
        buildingId,
        periodMonth,
        periodYear,
        p = "",
        page = 1,
        limit = 10,
      }) => ({
        url: "/landlords/utility-readings/rooms",
        method: "GET",
        params: {
          page,
          limit,
          p,
          ...(buildingId ? { buildingId } : {}),
          ...(periodMonth ? { periodMonth } : {}),
          ...(periodYear ? { periodYear } : {}),
        },
      }),
      providesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    getUtilityReadings: builder.query<
      // Lấy danh sách chỉ số điện nước
      IUtilityListResponse,
      {
        buildingId?: string;
        roomId?: string;
        status?: "draft" | "confirmed" | "billed";
        periodMonth?: string;
        periodYear?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({
        buildingId,
        roomId,
        status,
        periodMonth,
        periodYear,
        page = 1,
        limit = 10,
      }) => ({
        url: "/landlords/utility-readings",
        method: "GET",
        params: {
          page,
          limit,
          ...(buildingId ? { buildingId } : {}),
          ...(roomId ? { roomId } : {}),
          ...(status ? { status } : {}),
          ...(periodMonth ? { periodMonth } : {}),
          ...(periodYear ? { periodYear } : {}),
        },
      }),
      providesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    createUtilityReading: builder.mutation< // Tạo kỳ đọc chỉ số điện nước cho 1 phòng
      IUtilityListResponse,
      IUtilityReadingRequest
    >({
      query: (data) => ({
        url: "/landlords/utility-readings",
        method: "POST",
        data,
      }),
      invalidatesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    createUtilityReadingsBulk: builder.mutation< // Tạo hàng loạt chỉ số địện nước cho nhiều phòng
      IUtilityListResponse,
      ICreateUtilityBulkRequest
    >({
      query: (data) => ({
        url: "/landlords/utility-readings/bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    getUtilityReadingDetail: builder.query<IUtilityDetailResponse, string>({ // Xem chi tiết 1 kỳ chỉ số điện nước
      query: (id) => ({
        url: `/landlords/utility-readings/${id}`,
        method: "GET",
      }),
    }),
    updateUtilityReading: builder.mutation< // Cập nhật chỉ số khi status là draft
      IUtilityListResponse,
      { id: string; data: IUpdateReadingRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/utility-readings/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    deleteUtilityReading: builder.mutation<IUtilityListResponse, string>({
      query: (id) => ({
        url: `/landlords/utility-readings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
    confirmUtilityReading: builder.mutation<IUtilityListResponse, string>({ // Xác nhận và khóa chỉ số
      query: (id) => ({
        url: `/landlords/utility-readings/${id}/confirm`,
        method: "POST",
      }),
      invalidatesTags: ["UtilityReading", "UtilityReadingRoom"],
    }),
  }),
});

export const {
  useGetUtilityReadingsRoomQuery,
  useGetUtilityReadingsQuery,
  useGetUtilityReadingDetailQuery,
  useCreateUtilityReadingMutation,
  useCreateUtilityReadingsBulkMutation,
  useUpdateUtilityReadingMutation,
  useDeleteUtilityReadingMutation,
  useConfirmUtilityReadingMutation,
} = utilityApi;
