import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { ICommentMaintenanceRequest, IMaintenanceRequest, IMaintenanceResponse, IMaintenanceDetailResponse, IMaintenanceTenantResponse, IMaintenanceTenantDetailsResponse, IMaintenanceCreateRequest } from "@/types/maintenance";


export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Maintenance"],
  endpoints: (builder) => ({
    getMaintenances: builder.query<
      IMaintenanceResponse,
      {
        buildingId?: string;
        roomId?: string;
        furnitureId?: string;
        status?: "open" | "in_progress" | "resolved" | "rejected";
        priority?: "low" | "medium" | "high" | "urgent";
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ buildingId, roomId, furnitureId, status, priority, q, page, limit }) => ({
        url: "/landlords/maintenance",
        method: "GET",
        params: { buildingId, roomId, furnitureId, status, priority, q, page, limit },
      }),
      providesTags: ["Maintenance"],
    }),
    getMaintenanceDetails: builder.query<IMaintenanceDetailResponse, string>({
      query: (id) => ({
        url: `/landlords/maintenance/${id}`,
        method: "GET",
      }),
      providesTags: ["Maintenance"],
    }),
    updateMaintenance: builder.mutation<any, { id: string; data: IMaintenanceRequest }>({
      query: ({ id, data }) => ({
        url: `/landlords/maintenance/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Maintenance"],
    }),
    createComment: builder.mutation<any, { id: string; data: ICommentMaintenanceRequest }>({
      query: ({ id, data }) => ({
        url: `/landlords/maintenance/${id}/comment`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Maintenance"],
    }),

    // Tenant
    getTenantMaintenances: builder.query<IMaintenanceTenantResponse, {
      status?: "open" | "in_progress" | "resolved" | "rejected";
      priority?: "low" | "medium" | "high" | "urgent";
      page: number;
      limit: number;
    }>({
      query: ({ status, priority, page, limit }) => ({
        url: "/maintenance/my-room",
        method: "GET",
        params: { status, priority, page, limit },
      }),
      providesTags: ["Maintenance"],
    }),
    createMaintenance: builder.mutation<IMaintenanceTenantResponse, IMaintenanceCreateRequest>({
      query: (data) => ({
        url: "/maintenance",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Maintenance"],
    }),
    getMaintenanceTenantDetails: builder.query<IMaintenanceTenantDetailsResponse, string>({
      query: (id) => ({
        url: `/maintenance/${id}`,
        method: "GET",
      }),
      providesTags: ["Maintenance"],
    }),
    createCommentTenant: builder.mutation<any, { id: string; data: ICommentMaintenanceRequest }>({
      query: ({ id, data }) => ({
        url: `/maintenance/${id}/comment`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Maintenance"],
    })
  }),
});

export const {
  useGetMaintenancesQuery,
  useGetMaintenanceDetailsQuery,
  useUpdateMaintenanceMutation,
  useCreateCommentMutation,

  // Tenant
  useGetTenantMaintenancesQuery,
  useCreateMaintenanceMutation,
  useGetMaintenanceTenantDetailsQuery,
  useCreateCommentTenantMutation
} = maintenanceApi;
