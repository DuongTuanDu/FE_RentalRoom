import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IBuildingServiceRequest, IBuildingServicesResponse, IUpdateBuildingServiceRequest } from "@/types/building-services";

export const buildingServicesApi = createApi({
  reducerPath: "buildingServicesApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["BuildingServices"],
  endpoints: (builder) => ({
    getBuildingservices: builder.query<
      IBuildingServicesResponse,
      {
        buildingId: string;
        includeDeleted?: boolean;
      }
    >({
      query: ({ buildingId, includeDeleted }) => {
        const params = new URLSearchParams({
          includeDeleted: includeDeleted?.toString() || "false",
        });
        return {
          url: `/landlords/buildings/${buildingId}/services?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BuildingServices"],
    }),
    createBuildingservices: builder.mutation<
      IBuildingServicesResponse,
      { buildingId: string; data: IBuildingServiceRequest }
    >({
      query: ({ buildingId, data }) => ({
        url: `/landlords/buildings/${buildingId}/services`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["BuildingServices"],
    }),
    updateBuildingservices: builder.mutation<
      IBuildingServicesResponse,
      { id: string; buildingId: string; data: IUpdateBuildingServiceRequest }
    >({
      query: ({ id, data, buildingId }) => ({
        url: `/landlords/buildings/${buildingId}/services/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["BuildingServices"],
    }),
    deleteBuildingservices: builder.mutation<
      IBuildingServicesResponse,
      { id: string; buildingId: string }
    >({
      query: ({ id, buildingId }) => ({
        url: `/landlords/buildings/${buildingId}/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BuildingServices"],
    }),
    createRestoreBuildingservices: builder.mutation<
      IBuildingServicesResponse,
      { id: string; buildingId: string }
    >({
      query: ({ id, buildingId }) => ({
        url: `/landlords/buildings/${buildingId}/services/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["BuildingServices"],
    }),
  }),
});

export const {
  useGetBuildingservicesQuery,
  useCreateBuildingservicesMutation,
  useUpdateBuildingservicesMutation,
  useDeleteBuildingservicesMutation,
  useCreateRestoreBuildingservicesMutation
} = buildingServicesApi;
