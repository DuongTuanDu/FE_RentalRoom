import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IGetTermsResponse,
  IGetTermDetailResponse,
  ITermRequest,
  ITermUpdateRequest,
} from "@/types/term";

export const termApi = createApi({
  reducerPath: "termApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Term"],
  endpoints: (builder) => ({
    getTerms: builder.query<
      IGetTermsResponse,
      {
        buildingId: string;
        page?: number;
        limit?: number;
        status?: "active" | "inactive";
      }
    >({
      query: ({ buildingId, page = 1, limit = 10, status }) => ({
        url: `/landlords/terms/building/${buildingId}`,
        method: "GET",
        params: {
          page,
          limit,
          buildingId,
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Term"],
    }),
    createTerm: builder.mutation<IGetTermsResponse, ITermRequest>({
      query: (data) => ({
        url: "/landlords/terms",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Term"],
    }),
    updateTerm: builder.mutation<
      IGetTermsResponse,
      { id: string; data: ITermUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/terms/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Term"],
    }),
    deleteTerm: builder.mutation<IGetTermsResponse, string>({
      query: (id) => ({
        url: `/landlords/terms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Term"],
    }),
    getTermDetail: builder.query<IGetTermDetailResponse, string>({
      query: (id) => ({
        url: `/landlords/terms/detail/${id}`,
        method: "GET",
      }),
      providesTags: ["Term"],
    }),
  }),
});

export const {
  useGetTermsQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
  useGetTermDetailQuery,
} = termApi;
