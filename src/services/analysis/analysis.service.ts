import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IAnalyticsAdminResponse } from "@/types/analysis";

export const analysisApi = createApi({
  reducerPath: "analysisApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["Analysis"],
  endpoints: (builder) => ({
    getAnalysis: builder.query<
      IAnalyticsAdminResponse,
      {
        filter?: "today" | "week" | "month" | "year" | "custom" | string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ filter, startDate, endDate }) => ({
        url: `/admin/dashboard`,
        method: "GET",
        params: { filter, startDate, endDate },
      }),
      providesTags: ["Analysis"],
    }),
  }),
});

export const { useGetAnalysisQuery } = analysisApi;
