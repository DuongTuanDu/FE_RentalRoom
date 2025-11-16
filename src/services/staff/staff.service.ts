import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IStaff,
  IPermission,
  ICreateStaffRequest,
  ICreateStaffResponse,
  IFirstTimeChangePasswordResponse,
  IFirstTimeChangePasswordRequest,
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

    getPermissionsByAccountId: builder.query<string[], {accountId: string}>({
      query: ({ accountId }) => ({
        url: `/landlords/staffs/${accountId}/permissions`,
        method: "GET",
      }),
      providesTags: ["Staff"],
    }),

    createStaff: builder.mutation<ICreateStaffResponse, ICreateStaffRequest>({
      query: (data) => ({
        url: `/landlords/staffs/create`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Staff"],
    }),

    firstTimeChangePassword: builder.mutation<
      IFirstTimeChangePasswordResponse,
      IFirstTimeChangePasswordRequest
    >({
      query: (data) => ({
        url: `/auth/change-password-first`,
        method: "POST",
        data,
      }),
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
  useGetPermissionsByAccountIdQuery,
  useLazyGetPermissionsByAccountIdQuery,
  useCreateStaffMutation,
  useFirstTimeChangePasswordMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffInfoMutation,
  useUpdateStaffPermissionsMutation,
} = staffApi;
