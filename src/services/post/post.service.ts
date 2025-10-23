import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IGenerateAIDescriptionRequest, IGenerateAIDescriptionResponse, IGetPostsResponse } from "@/types/post";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<IGetPostsResponse, void>({
      query: () => {
        return {
          url: "/landlords/posts",
          method: "GET",
        };
      },
      providesTags: ["Post"],
    }),
    aiGeneratePost: builder.mutation<IGenerateAIDescriptionResponse, IGenerateAIDescriptionRequest>({
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
          'Content-Type': 'multipart/form-data',
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
    })
  }),
});

export const { useGetPostsQuery, useAiGeneratePostMutation, useCreatePostMutation, useSoftDeletePostMutation } = postApi;
