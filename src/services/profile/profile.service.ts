import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { GetUserInfoResponse } from "@/types/profile";
import { setUserInfo } from "../auth/auth.slice";

const API_URL = import.meta.env.VITE_APP_API_SHIP_URL;
const TOKEN = import.meta.env.VITE_APP_TOKEN_SHIP;

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({
      url,
      method,
      data,
      params,
      config: {
        headers: {
          Token: TOKEN,
        },
      },
    });
  },
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<GetUserInfoResponse, void>({
      query: () => {
        return {
          url: "/profiles",
          method: "GET",
        };
      },
      providesTags: ["Profile"],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserInfo(data.user));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/profiles",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getProvinces: builder.query<any, void>({
      query: () => {
        return {
          url: API_URL + `/master-data/province`,
          method: "GET",
        };
      },
    }),
    getDistricts: builder.query<any, string>({
      query: (provinceId) => {
        return {
          url: API_URL + `/master-data/district?province_id=${provinceId}`,
          method: "GET",
        };
      },
    }),
    getWards: builder.query<any, string>({
      query: (districtId) => {
        return {
          url: API_URL + `/master-data/ward?district_id=${districtId}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } = profileApi;
