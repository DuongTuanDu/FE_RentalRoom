import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IStaff,
  IPermission,
  ICreateStaffRequest,
  IUpdateInactiveStaffRequest,
  IUpdateInactiveStaffResponse,
  IUpdateStaffInfoRequest,
  IUpdateStaffPermissionRequest,
  IUpdateStaffPermissionResponse,
} from "@/types/staff";

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Staff"],

  endpoints: (builder) => ({
    getStaffList: builder.query<IStaff[], void>({
      query: () => ({
        url: `/landlords/staffs/list`,
        method: "GET",
      }),
      providesTags: ["Staff"],
    }),

    getPermissions: builder.query<IPermission[], void>({
      query: () => ({
        url: `/landlords/staffs/permissions`,
        method: "GET",
      }),
      providesTags: ["Staff"],
    }),

    createStaff: builder.mutation<IStaff, ICreateStaffRequest>({
      query: (data) => ({
        url: `/landlords/staffs/create`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Staff"],
    }),

    updateStaffStatus: builder.mutation<
      IUpdateInactiveStaffResponse,
      { staffId: string; body: IUpdateInactiveStaffRequest }
    >({
      query: ({ staffId, body }) => ({
        url: `/landlords/staffs/${staffId}/status`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Staff"],
    }),

    updateStaffInfo: builder.mutation<
      IStaff,
      { staffId: string; body: IUpdateStaffInfoRequest }
    >({
      query: ({ staffId, body }) => ({
        url: `/landlords/staffs/${staffId}/info`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Staff"],
    }),

    updateStaffPermissions: builder.mutation<
      IUpdateStaffPermissionResponse,
      { staffId: string; body: IUpdateStaffPermissionRequest }
    >({
      query: ({ staffId, body }) => ({
        url: `/landlords/staffs/${staffId}/permissions`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useGetPermissionsQuery,
  useCreateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffInfoMutation,
  useUpdateStaffPermissionsMutation,
} = staffApi;
