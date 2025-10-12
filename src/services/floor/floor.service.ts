import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { CreateFloorRequest, IFloorListResponse } from "@/types/floor";

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
      }
    >({
      query: ({ buildingId }) => {
        const params = new URLSearchParams({
          buildingId: buildingId || "",
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
      { id: string; label: string; level: number; description?: string }
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
        url: `/floors/${id}`,
        method: "DELETE",
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
} = floorApi;
