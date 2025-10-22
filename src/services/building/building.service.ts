import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { CreateBuildingRequest, CreateBuildingResponse, CreateQuickBuildingRequest, IBuildingResponse } from "@/types/building"; // bạn có thể lưu type trong thư mục riêng

export const buildingApi = createApi({
  reducerPath: "buildingApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Building"],
  endpoints: (builder) => ({
    getBuildings: builder.query<
      IBuildingResponse,
      {
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page, limit, q }) => {
        const params = new URLSearchParams({
          page: page?.toString() || "1",
          limit: limit?.toString() || "10",
          q: q || "",
        });
        return {
          url: `/buildings?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Building"],
    }),
    createBuilding: builder.mutation<CreateBuildingResponse, CreateBuildingRequest>({
      query: (data) => ({
        url: "/buildings",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Building"],
    }),
    updateBuilding: builder.mutation<CreateBuildingResponse, { id: string; data: Partial<CreateBuildingRequest> }>({
      query: ({ id, data }) => ({
        url: `/buildings/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Building"],
    }),
    deleteBuilding: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Building"],
    }),
    createQuickBuilding: builder.mutation<CreateBuildingResponse, CreateQuickBuildingRequest>({
      query: (data) => ({
        url: "/buildings/quick-setup",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Building"],
    })
  }),
});

export const { useGetBuildingsQuery, useCreateBuildingMutation, useUpdateBuildingMutation, useDeleteBuildingMutation, useCreateQuickBuildingMutation } = buildingApi;
