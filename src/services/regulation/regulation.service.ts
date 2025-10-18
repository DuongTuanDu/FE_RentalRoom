import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IRegulationRequest, IRegulationRequestUpdate, IRegulationResponse } from "@/types/regulation";

export const regulationApi = createApi({
  reducerPath: "regulationApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Regulation"],
  endpoints: (builder) => ({
    getRegulations: builder.query<
      IRegulationResponse,
      {
        buildingId: string;
      }
    >({
      query: ({ buildingId }) => {
        const params = new URLSearchParams({
          buildingId: buildingId,
        });
        return {
          url: `/regulations?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Regulation"],
    }),
    createRegulation: builder.mutation<IRegulationResponse, IRegulationRequest>({
      query: (data) => ({
        url: "/regulations",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Regulation"],
    }),
    updateRegulation: builder.mutation<
      IRegulationResponse,
      { id: string; data: IRegulationRequestUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/regulations/${id}`,
        method: "PUT",
        data
      }),
      invalidatesTags: ["Regulation"],
    }),
    deleteRegulation: builder.mutation<IRegulationResponse, string>({
      query: (id) => ({
        url: `/regulations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Regulation"],
    }),
  }),
});

export const {
  useGetRegulationsQuery,
  useCreateRegulationMutation,
  useUpdateRegulationMutation,
  useDeleteRegulationMutation,
} = regulationApi;
