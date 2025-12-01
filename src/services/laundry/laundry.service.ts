import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  ILaundryDeviceRequest,
  IWasherListResponse,
} from "@/types/laundry";

export const laundryApi = createApi({
  reducerPath: "laundryApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Laundry"],
  endpoints: (builder) => ({
    getLaundryFloors: builder.query<
      IWasherListResponse,
      {
        buildingId: string;
        floorId?: string;
        status?: "running" | "idle" | "unknown";
      }
    >({
      query: ({ buildingId, floorId, status }) => ({
        url: `/landlords/buildings/${buildingId}/laundry-devices`,
        method: "GET",
        params: {
          buildingId,
          ...(floorId ? { floorId } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Laundry"],
    }),
    createLaundryFloor: builder.mutation< // Thêm thiết bị giặt sấy cho tầng
      IWasherListResponse,
      { id: string; data: ILaundryDeviceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/floors/${id}/laundry-devices`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Laundry"],
    }),
    updateLaundryFloor: builder.mutation< // Cập nhật thiết bị giặt sấy
      IWasherListResponse,
      { id: string; deviceId: string; data: ILaundryDeviceRequest }
    >({
      query: ({ id, deviceId, data }) => ({
        url: `/landlords/floors/${id}/laundry-devices/${deviceId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Laundry"],
    }),
    deleteLaundryFloor: builder.mutation<IWasherListResponse, { id: string; deviceId: string }>({ // Xóa thiết bị giặt sấy khỏi tầng
      query: ({ id, deviceId }) => ({
        url: `/landlords/floors/${id}/laundry-devices/${deviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Laundry"],
    })
  }),
});

export const {
  useGetLaundryFloorsQuery,
  useCreateLaundryFloorMutation,
  useUpdateLaundryFloorMutation,
  useDeleteLaundryFloorMutation,
} = laundryApi;
