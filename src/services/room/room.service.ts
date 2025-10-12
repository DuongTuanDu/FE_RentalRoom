import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IRoomListResponse } from "@/types/room";

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getRooms: builder.query<
      IRoomListResponse,
      {
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page, limit, q }) => {
        const params = new URLSearchParams({
          page: page?.toString() || "1",
          limit: limit?.toString() || "10",
          q: q || "",
        });
        return {
          url: `/rooms?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Room"],
    })
  }),
});

export const { useGetRoomsQuery } = roomApi;
