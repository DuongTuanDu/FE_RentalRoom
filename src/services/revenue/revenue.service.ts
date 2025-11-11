import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IRevenue,
  IRevenueRequest,
  IRevenueResponse,
  IRevenueStatisticsResponse,
} from "@/types/revenue";

export const revenueApi = createApi({
  reducerPath: "revenueApi",
  baseQuery: async (args) => {
    const { url, method, data, params, responseType } = args;
    return baseQuery({ url, method, data, params, responseType });
  },
  tagTypes: ["Revenue"],
  endpoints: (builder) => ({
    getRevenues: builder.query<
      IRevenueResponse,
      {
        buildingId?: string;
        type?: "revenue" | "expenditure";
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ buildingId, type, startDate, endDate, page, limit }) => {
        const params = new URLSearchParams();

        if (buildingId) params.append("buildingId", buildingId);
        if (type) params.append("type", type);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        params.append("page", page?.toString() || "1");
        params.append("limit", limit?.toString() || "10");

        return {
          url: `/landlords/revenue-expenditure?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Revenue"],
    }),
    createRevenue: builder.mutation<IRevenueResponse, IRevenueRequest>({
      //ghi nhận thu chi hoặc chi mới
      query: (data) => ({
        url: "/landlords/revenue-expenditure",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Revenue"],
    }),
    updateRevenue: builder.mutation<
      IRevenueResponse,
      { id: string; data: IRevenueRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/revenue-expenditure/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Revenue"],
    }),
    deleteRevenue: builder.mutation<IRevenueResponse, string>({
      query: (id) => ({
        url: `/landlords/revenue-expenditure/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Revenue"],
    }),
    getRevenueDetails: builder.query<IRevenue, string>({
      query: (id) => ({
        url: `/landlords/revenue-expenditure/${id}`,
        method: "GET",
      }),
    }),
    getRevenueByStats: builder.query< //Thống kê thu chi theo tháng năm
      IRevenueStatisticsResponse,
      {
        buildingId?: string;
        year?: number;
        month?: number;
      }
    >({
      query: ({ buildingId, year, month }) => ({
        url: `/landlords/revenue-expenditure/stats`,
        method: "GET",
        params: { buildingId, year, month },
      }),
    }),
    getExportExcelRevenue: builder.query<Blob, { //Xuất excel báo cáo thu chi
      buildingId?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: ({ buildingId, startDate, endDate }) => ({
        url: `/landlords/revenue-expenditure/export`,
        method: "GET",
        params: { buildingId, startDate, endDate },
        responseType: "blob",
      }),
    })
  }),
});

export const {
  useGetRevenuesQuery,
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteRevenueMutation,
  useGetRevenueDetailsQuery,
  useGetRevenueByStatsQuery,
  useLazyGetExportExcelRevenueQuery,
} = revenueApi;
