import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";

export interface IOverviewStats {
  buildingId: string;
  buildingName: string;
  totalPeople: number;
  totalRoomsAvailable: number;
  totalRoomsRented: number;
  activeContracts: number;
}

export interface IActivityStats {
  range: {
    start: string;
    end: string;
    month: string | null;
  };
  labels: string[];
  series: {
    postsActive: number[];
    contactsActive: number[];
  };
}

export interface IOverviewResponse {
  success: boolean;
  data: IOverviewStats[];
}

export interface IActivityResponse {
  success: boolean;
  data: IActivityStats;
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  endpoints: (builder) => ({
    getOverview: builder.query<IOverviewResponse, { buildingId?: string }>({
      query: (params) => ({
        url: "/landlords/dashboard/overview",
        method: "GET",
        params,
      }),
    }),
    getActivity: builder.query<
      IActivityResponse,
      { buildingId?: string; month?: string }
    >({
      query: (params) => ({
        url: "/landlords/dashboard/activity",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetOverviewQuery, useGetActivityQuery } = dashboardApi;
