import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  CreateFloorRequest,
  IFloorListResponse,
  QuiclCreateFloorRequest,
} from "@/types/floor";

export const floorApi = createApi({
  reducerPath: "floorApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Floor"],
  endpoints: (builder) => ({
    getFloors: builder.query<
      IFloorListResponse,
      {
        buildingId?: string;
        page?: number;
        limit?: number;
        status?: "active" | "inactive";
        q?: string;
      }
    >({
      query: ({ buildingId, page = 1, limit = 10, status, q = "" }) => ({
        url: "/landlords/floors",
        method: "GET",
        params: {
          page,
          limit,
          q,
          ...(buildingId ? { buildingId } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Floor"],
    }),
    createFloor: builder.mutation<IFloorListResponse, CreateFloorRequest>({
      query: (data) => ({
        url: "/landlords/floors",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Floor"],
    }),
    updateFloor: builder.mutation<
      IFloorListResponse,
      { id: string; level: number; description?: string }
    >({
      query: ({ id, ...updateData }) => ({
        url: `/landlords/floors/${id}`,
        method: "PUT",
        data: updateData,
      }),
      invalidatesTags: ["Floor"],
    }),
    deleteFloor: builder.mutation<IFloorListResponse, string>({
      query: (id) => ({
        url: `/landlords/floors/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["Floor"],
    }),
    updateStatusFloor: builder.mutation<
      IFloorListResponse,
      { id: string; status: "active" | "inactive" }
    >({
      query: ({ id, status }) => ({
        url: `/landlords/floors/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Floor"],
    }),
    quickCreateFloor: builder.mutation<
      IFloorListResponse,
      QuiclCreateFloorRequest
    >({
      query: (data) => ({
        url: "/landlords/floors/quick-create",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Floor"],
    }),
  }),
});

export const {
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
  useUpdateStatusFloorMutation,
  useQuickCreateFloorMutation,
} = floorApi;
