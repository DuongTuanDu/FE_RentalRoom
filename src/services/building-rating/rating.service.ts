// src/services/rating/rating.service.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";

import type {
    GetRatingsResidentResponse,
  RatingDetailResponse,
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


    // getManagedRatings: builder.query<GetRatingsResponse, { page?: number; limit?: number }>({
    //   query: ({ page = 1, limit = 20 }) => ({
    //     url: "/landlords/ratings",
    //     params: { page, limit },
    //   }),
    //   providesTags: (result) =>[]
       
    // }),

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
      invalidatesTags: ["Ratings", "ManagedRatings", "BuildingRatings"],
    }),
  }),
});

export const {
  useCreateOrUpdateRatingMutation,
  useGetBuildingRatingsQuery,
  useDeleteMyRatingMutation,

  useGetRatingDetailByLandlordQuery,
  useDeleteRatingByLandlordMutation,

  useLazyGetBuildingRatingsQuery,
} = ratingApi;