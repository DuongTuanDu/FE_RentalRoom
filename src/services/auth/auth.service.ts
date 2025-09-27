import { createApi } from "@reduxjs/toolkit/query/react";
import RentalRoomFetch from "@/lib/api-client";
import { setLogin } from "./auth.slice";
import type IAuth from "@/types/auth";

export interface ILoginRequest {
  email: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return RentalRoomFetch({ url, method, data, params });
  },
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    login: builder.mutation<IAuth, ILoginRequest>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setLogin(data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    register: builder.mutation<IAuth, ILoginRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        data,
      }),
    }),
    sentOTP: builder.mutation<IAuth,  { email: string, type: string }>({
      query: (data: { email: string, type: string }) => ({
        url: "/auth/send-otp",
        method: "POST",
        data,
      }),
    }),
    verifyOTP: builder.mutation<IAuth,  { email: string, otp: string, type: string }>({
      query: (data: { email: string, otp: string, type: string }) => ({
        url: "/auth/verify-otp",
        method: "POST",
        data,
      }),
    }),
    resetPassword: builder.mutation<IAuth,  { email: string, newPassword: string, confirmNewPassword: string }>({
      query: (data: { email: string, newPassword: string, confirmNewPassword: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        data,
      }),
    })
  }),
});

export const { useLoginMutation, useRegisterMutation, useSentOTPMutation, useVerifyOTPMutation, useResetPasswordMutation } = authApi;
