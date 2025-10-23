import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { CreateFloorRequest, IFloorListResponse, QuiclCreateFloorRequest } from "@/types/floor";

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
      }
    >({
      query: ({ buildingId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          buildingId: buildingId || "",
          page: page.toString(),
          limit: limit.toString(),
        });
        return {
          url: `/floors?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Floor"],
    }),
    createFloor: builder.mutation<IFloorListResponse, CreateFloorRequest>({
      query: (data) => ({
        url: "/floors",
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
        url: `/floors/${id}`,
        method: "PUT",
        data: updateData,
      }),
      invalidatesTags: ["Floor"],
    }),
    deleteFloor: builder.mutation<IFloorListResponse, string>({
      query: (id) => ({
        url: `/floors/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["Floor"],
    }),
    updateStatusFloor: builder.mutation<IFloorListResponse, { id: string; status: "active" | "inactive" }>({
      query: ({ id, status }) => ({
        url: `/floors/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Floor"],
    }),
    quickCreateFloor: builder.mutation<IFloorListResponse, QuiclCreateFloorRequest>({
      query: (data) => ({
        url: "/floors/quick-create",
        method: "POST",
        data
      }),
      invalidatesTags: ["Floor"],
    })
  }),
});

export const {
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
  useUpdateStatusFloorMutation,
  useQuickCreateFloorMutation
} = floorApi;
