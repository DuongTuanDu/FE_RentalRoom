import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IGenerateAIDescriptionRequest,
  IGenerateAIDescriptionResponse,
  IGetPostDetailResponse,
  IGetPostsResponse,
} from "@/types/post";
import type { IVacantRoomResponse } from "@/types/room";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<
      IGetPostsResponse,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page, limit }) => {
        const params = new URLSearchParams({
          page: page?.toString() || "1",
          limit: limit?.toString() || "10",
        });
        return {
          url: `/landlords/posts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Post"],
    }),
    aiGeneratePost: builder.mutation<
      IGenerateAIDescriptionResponse,
      IGenerateAIDescriptionRequest
    >({
      query: (data) => ({
        url: "/landlords/posts/ai-generate",
        method: "POST",
        data,
      }),
    }),
    createPost: builder.mutation<IGetPostsResponse, FormData>({
      query: (data) => ({
        url: "/landlords/posts",
        method: "POST",
        data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["Post"],
    }),
    softDeletePost: builder.mutation<IGetPostsResponse, string>({
      query: (id) => ({
        url: `/landlords/posts/${id}/soft-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Post"],
    }),
    getVacantRoomsByBuildingId: builder.query<IVacantRoomResponse, string>({
      query: (buildingId) => ({
        url: `/landlords/posts/${buildingId}/info`,
        method: "GET",
      }),
    }),
    getPostDetails: builder.query<IGetPostDetailResponse, string>({
      query: (id) => ({
        url: `/landlords/posts/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useAiGeneratePostMutation,
  useCreatePostMutation,
  useSoftDeletePostMutation,
  useGetVacantRoomsByBuildingIdQuery,
  useGetPostDetailsQuery,
} = postApi;
