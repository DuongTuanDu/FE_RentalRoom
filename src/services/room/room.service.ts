import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IRoomListResponse,
  IRoom,
  CreateRoomRequest,
  IQuickCreateRoomRequest,
  IMyRoomResponse,
  IRoomContractResponse,
} from "@/types/room";
import type {
  IRoommateDetail,
  IRoommateRequest,
  IRoommateResponse,
  ISearchRoommateResponse,
} from "@/types/roommate";

const customBaseQuery = async (args: any) => {
  const { url, method, data, params } = args;
  return baseQuery({ url, method, data, params });
};

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Room", "MyRoom", "Roommate"],
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
          url: `/landlords/rooms?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<
      IRoom,
      CreateRoomRequest & { images?: File[] }
    >({
      query: (data) => {
        if (data.images && data.images.length > 0) {
          const formData = new FormData();
          const { images, ...roomInfo } = data;

          formData.append("data", JSON.stringify(roomInfo));

          images.forEach((file) => {
            formData.append("images", file);
          });

          return {
            url: "/landlords/rooms",
            method: "POST",
            data: formData,
          };
        }

        return {
          url: "/landlords/rooms",
          method: "POST",
          data: data,
        };
      },
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<IRoom, { id: string; data: any }>({
      query: ({ id, data }) => {
        const formData = new FormData();

        if (data.roomNumber !== undefined)
          formData.append("roomNumber", data.roomNumber);
        if (data.area !== undefined)
          formData.append("area", data.area.toString());
        if (data.price !== undefined)
          formData.append("price", data.price.toString());
        if (data.maxTenants !== undefined)
          formData.append("maxTenants", data.maxTenants.toString());
        if (data.status !== undefined) formData.append("status", data.status);
        if (data.description !== undefined)
          formData.append("description", data.description);
        if (data.floorId !== undefined)
          formData.append("floorId", data.floorId);

        if (data.removeUrls && data.removeUrls.length > 0) {
          formData.append("removeUrls", JSON.stringify(data.removeUrls));
        }
        if (data.replaceAllImages !== undefined) {
          formData.append("replaceAllImages", data.replaceAllImages.toString());
        }

        if (data.images && data.images.length > 0) {
          data.images.forEach((file: File) => {
            formData.append("images", file);
          });
        }

        return {
          url: `/landlords/rooms/${id}`,
          method: "PUT",
          data: formData,
        };
      },
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/landlords/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    activeRoom: builder.mutation<IRoom, { id: string; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/landlords/rooms/${id}/active`,
        method: "PATCH",
        data: { active },
      }),
      invalidatesTags: ["Room"],
    }),

    addRoomImages: builder.mutation<
      { message: string; images: string[] },
      { id: string; images: File[] | FormData }
    >({
      query: ({ id, images }) => {
        if (images instanceof FormData) {
          return {
            url: `/landlords/rooms/${id}/images`,
            method: "POST",
            data: images,
          };
        }
        const formData = new FormData();
        if (Array.isArray(images)) {
          images.forEach((file) => formData.append("images", file));
        }
        return {
          url: `/landlords/rooms/${id}/images`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: ["Room"],
    }),

    removeRoomImages: builder.mutation<
      { message: string; images: string[]; deleted: number },
      { id: string; urls: string[] }
    >({
      query: ({ id, urls }) => ({
        url: `/landlords/rooms/${id}/images`,
        method: "DELETE",
        data: { urls },
      }),
      invalidatesTags: ["Room"],
    }),
    getRoomById: builder.query<IRoom, string>({
      query: (id) => ({
        url: `/landlords/rooms/${id}`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),
    quickCreate: builder.mutation<IRoom, IQuickCreateRoomRequest>({
      query: (data) => ({
        url: "/landlords/rooms/quick-create",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Room"],
    }),

    getMyRoom: builder.query<IMyRoomResponse, void>({
      query: () => ({
        url: "/rooms/my-room",
        method: "GET",
      }),
      providesTags: ["MyRoom"],
    }),
    getRoommateSearch: builder.query<ISearchRoommateResponse, { q: string }>({
      query: ({ q }) => ({
        url: "/roommates/search",
        method: "GET",
        params: { q },
      }),
    }),
    getRoommatesByRoomId: builder.query<IRoommateResponse, string>({
      query: (roomId) => ({
        url: `/roommates/${roomId}`,
        method: "GET",
      }),
      providesTags: ["Roommate"],
    }),
    getRoommateDetail: builder.query<IRoommateDetail, string>({
      query: (userId) => ({
        url: `/roommates/${userId}/detail`,
        method: "GET",
      }),
    }),
    addRoommate: builder.mutation<IRoommateResponse, IRoommateRequest>({
      query: (data) => ({
        url: "/roommates/add",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roommate"],
    }),
    removeRoommate: builder.mutation<IRoommateResponse, IRoommateRequest>({
      query: (data) => ({
        url: "/roommates/remove",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roommate"],
    }),
    leaveRoommate: builder.mutation<IRoommateResponse, { roomId: string }>({
      query: ({ roomId }) => ({
        url: "/roommates/leave",
        method: "POST",
        data: { roomId },
      }),
      invalidatesTags: ["Roommate", "MyRoom"],
    }),
    roomActiveContract: builder.query<IRoomContractResponse, string>({
      query: (id) => ({
        url: `/landlords/rooms/${id}/active-contract`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useActiveRoomMutation,
  useAddRoomImagesMutation,
  useRemoveRoomImagesMutation,
  useGetRoomByIdQuery,
  useQuickCreateMutation,
  useGetMyRoomQuery,
  useGetRoommateSearchQuery,
  useGetRoommatesByRoomIdQuery,
  useGetRoommateDetailQuery,
  useAddRoommateMutation,
  useRemoveRoommateMutation,
  useLeaveRoommateMutation,
  useRoomActiveContractQuery,
} = roomApi;
