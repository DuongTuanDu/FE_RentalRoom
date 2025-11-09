// src/lib/api/landlordScheduleApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IUpsertScheduleRequest,
  IGetScheduleResponse,
  IUpsertScheduleResponse,
  IDeleteScheduleResponse
} from "@/types/landlord-schedule";

export const landlordScheduleApi = createApi({
  reducerPath: "landlordScheduleApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["LandlordSchedule"],
  endpoints: (builder) => ({
    upsertSchedule: builder.mutation<
      IUpsertScheduleResponse,
      IUpsertScheduleRequest
    >({
      query: (data) => ({
        url: "/landlords/schedules",
        method: "POST",
        data,
      }),
      invalidatesTags: ["LandlordSchedule"],
    }),

    getScheduleByBuilding: builder.query<IGetScheduleResponse, string>({
      query: (buildingId) => ({
        url: `/landlords/schedules/${buildingId}`,
        method: "GET",
      }),
      providesTags: ["LandlordSchedule"],
    }),

    deleteSchedule: builder.mutation<IDeleteScheduleResponse, string>({
      query: (buildingId) => ({
        url: `/landlords/schedules/${buildingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LandlordSchedule"],
    }),
  }),
});

export const {
  useUpsertScheduleMutation,
  useGetScheduleByBuildingQuery,
  useDeleteScheduleMutation,
} = landlordScheduleApi;
