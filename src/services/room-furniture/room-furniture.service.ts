import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IFurnitureRoomRequest,
  IFurnitureRoomRequestUpdate,
  IFurnitureRoomResponse,
} from "@/types/room-furniture";

// Helper: loại bỏ key có giá trị '', null, undefined
const pruneParams = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) out[k] = v;
  });
  return out;
};

export const roomFurnitureApi = createApi({
  reducerPath: "roomFurnitureApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args as any;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["RoomFurniture"],
  endpoints: (builder) => ({
    // Lấy danh sách theo tòa / tầng / phòng
    getRoomFurnitures: builder.query<
      IFurnitureRoomResponse,
      { buildingId?: string; floorId?: string; roomId?: string }
    >({
      query: ({ buildingId, floorId, roomId }) => {
        const params = pruneParams({ buildingId, floorId, roomId });
        return {
          url: "/furnitures/room",
          method: "GET",
          params, // <-- để baseQuery tự nối query
        };
      },
      // đảm bảo refetch khi params đổi
      keepUnusedDataFor: 5,
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
