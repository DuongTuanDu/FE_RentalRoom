// src/services/rating/rating.service.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";

import type {
  GetRatingsResidentResponse,
  RatingDetailResponse,
  GetLandlordRatingsResponse,
} from "@/types/rating";

export const ratingApi = createApi({
  reducerPath: "ratingApi",
  baseQuery,
  tagTypes: ["Ratings", "BuildingRatings", "ManagedRatings"],

  endpoints: (builder) => ({
  
    createOrUpdateRating: builder.mutation<RatingDetailResponse, FormData>({
      query: (formData) => ({
        url: "/ratings",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": undefined,
        },
      }),
      invalidatesTags: ["Ratings", "BuildingRatings"],
    }),

    getBuildingRatings: builder.query<GetRatingsResidentResponse, { buildingId: string; page?: number; limit?: number }>({
      query: ({ buildingId, page = 1, limit = 10 }) => ({
        url: `/ratings/${buildingId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
     
      ],
    }),

    deleteMyRating: builder.mutation<{ success: true; message: string }, string>({
      query: (ratingId) => ({
        url: `/ratings/${ratingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ratings", "BuildingRatings"],
    }),


    getManagedRatings: builder.query<
      GetLandlordRatingsResponse,
      { buildingId?: string; page?: number; limit?: number }
    >({
      query: ({ buildingId, page = 1, limit = 20 }) => ({
        url: "/landlords/ratings",
        params: {
          ...(buildingId && { buildingId }),
          page,
          limit,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.ratings.map(({ _id }) => ({
                type: "ManagedRatings" as const,
                id: _id,
              })),
              { type: "ManagedRatings", id: "LIST" },
            ]
          : [{ type: "ManagedRatings", id: "LIST" }],
    }),

    getRatingDetailByLandlord: builder.query<RatingDetailResponse, string>({
      query: (ratingId) => ({
        url: `/landlords/ratings/${ratingId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Ratings", id }],
    }),

    deleteRatingByLandlord: builder.mutation<{ success: true; message: string }, string>({
      query: (ratingId) => ({
        url: `/landlords/ratings/${ratingId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, ratingId) => [
        { type: "ManagedRatings", id: ratingId },
        { type: "ManagedRatings", id: "LIST" },
        "BuildingRatings",
      ],
    }),
  }),
});

export const {
  useCreateOrUpdateRatingMutation,
  useGetBuildingRatingsQuery,
  useDeleteMyRatingMutation,
  useGetManagedRatingsQuery,
  useLazyGetManagedRatingsQuery,
  useGetRatingDetailByLandlordQuery,
  useDeleteRatingByLandlordMutation,
} = ratingApi;