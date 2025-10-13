import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IRoomListResponse, IRoom, CreateRoomRequest } from "@/types/room";

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getRooms: builder.query<
      IRoomListResponse,
      {
        buildingId?: string;
        floorId?: string;
        status?: "available" | "occupied" | "maintenance";
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ buildingId, floorId, status, q, page, limit }) => {
        const params = new URLSearchParams();
        
        if (buildingId) params.append("buildingId", buildingId);
        if (floorId) params.append("floorId", floorId);
        if (status) params.append("status", status);
        if (q) params.append("q", q);
        params.append("page", page?.toString() || "1");
        params.append("limit", limit?.toString() || "20");

        return {
          url: `/rooms?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<IRoom, CreateRoomRequest>({
      query: (data) => ({
        url: "/rooms",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<IRoom, { id: string; data: Partial<IRoom> }>({
      query: ({ id, data }) => ({
        url: `/rooms/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi;