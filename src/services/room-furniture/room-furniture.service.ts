import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IFurnitureRoomRequest,
  IFurnitureRoomRequestUpdate,
  IFurnitureRoomResponse,
} from "@/types/room-furniture";

export const roomFurnitureApi = createApi({
  reducerPath: "roomFurnitureApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["RoomFurniture"],
  endpoints: (builder) => ({
    getRoomFurnitures: builder.query<
      IFurnitureRoomResponse,
      {
        roomId?: string;
      }
    >({
      query: ({ roomId }) => {
        const params = new URLSearchParams({
          roomId: roomId || "",
        });
        return {
          url: `/furnitures/room?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["RoomFurniture"],
    }),
    createRoomFurniture: builder.mutation<
      IFurnitureRoomResponse,
      IFurnitureRoomRequest
    >({
      query: (data) => ({
        url: "/furnitures/room",
        method: "POST",
        data,
      }),
      invalidatesTags: ["RoomFurniture"],
    }),
    updateRoomFurniture: builder.mutation<
      IFurnitureRoomResponse,
      { id: string; data: IFurnitureRoomRequestUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/furnitures/room/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["RoomFurniture"],
    }),
    deleteRoomFurniture: builder.mutation<IFurnitureRoomResponse, string>({
      query: (id) => ({
        url: `/furnitures/room/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoomFurniture"],
    }),
  }),
});

export const {
  useGetRoomFurnituresQuery,
  useCreateRoomFurnitureMutation,
  useUpdateRoomFurnitureMutation,
  useDeleteRoomFurnitureMutation,
} = roomFurnitureApi;
