import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IRoomAppointmentListResponse,
  IRoomAppointmentDetailResponse,
  IGetRoomAppointmentsParams,
  IUpdateAppointmentStatusRequest,
  IUpdateAppointmentStatusResponse,
  ICreateAppointmentRequest,
  ICreateAppointmentResponse,
  IAvailableSlotsResponse,
  IGetAvailableSlotsParams,
  ICancelAppointmentResponse,
} from "@/types/room-appointment";

export const roomAppointmentApi = createApi({
  reducerPath: "roomAppointmentApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["RoomAppointments", "AppointmentDetail", "AvailableSlots"],
  endpoints: (builder) => ({
    getLandlordAppointments: builder.query<
      IRoomAppointmentListResponse,
      IGetRoomAppointmentsParams
    >({
      query: (params) => ({
        url: "/landlords/bookings",
        method: "GET",
        params,
      }),
      providesTags: ["RoomAppointments"],
    }),

    getLandlordAppointmentDetail: builder.query<
      IRoomAppointmentDetailResponse,
      string
    >({
      query: (id) => ({
        url: `/landlords/bookings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "AppointmentDetail", id },
      ],
    }),

    updateAppointmentStatus: builder.mutation<
      IUpdateAppointmentStatusResponse,
      IUpdateAppointmentStatusRequest
    >({
      query: ({ id, data }) => ({
        url: `/landlords/bookings/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["RoomAppointments", "AppointmentDetail"],
    }),

    getTenantAppointments: builder.query<
      IRoomAppointmentListResponse,
      void
    >({
      query: (params) => ({
        url: "/bookings/my",
        method: "GET",
        params,
      }),
      providesTags: ["RoomAppointments"],
    }),

    createAppointment: builder.mutation<
      ICreateAppointmentResponse,
      ICreateAppointmentRequest
    >({
      query: (data) => ({
        url: "/bookings",
        method: "POST",
        data,
      }),
      invalidatesTags: ["RoomAppointments", "AvailableSlots"],
    }),

    getAvailableSlots: builder.query<IAvailableSlotsResponse,IGetAvailableSlotsParams>({
      query: ({ buildingId, startDate, endDate }) => ({
        url: `/bookings/available-slots/${buildingId}`,
        method: "GET",
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
      providesTags: (result, error, { buildingId }) => [
        { type: "AvailableSlots", id: buildingId },
      ],
    }),

    cancelAppointment: builder.mutation<ICancelAppointmentResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["RoomAppointments", "AppointmentDetail", "AvailableSlots"],
    }),
  }),
});

export const {
  useGetLandlordAppointmentsQuery,
  useGetLandlordAppointmentDetailQuery,
  useUpdateAppointmentStatusMutation,
  useGetTenantAppointmentsQuery,
  useCreateAppointmentMutation,
  useGetAvailableSlotsQuery,
  useLazyGetAvailableSlotsQuery,
  useCancelAppointmentMutation,
} = roomAppointmentApi;