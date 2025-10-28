import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import { setLogin } from "./auth.slice";
import type IAuth from "@/types/auth";

export interface ILoginRequest {
  email: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
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
          console.log("error", error);
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
    sentOTP: builder.mutation<IAuth, { email: string; type: string }>({
      query: (data: { email: string; type: string }) => ({
        url: "/auth/send-otp",
        method: "POST",
        data,
      }),
    }),
    verifyOTP: builder.mutation<
      IAuth,
      { email: string; otp: string; type: string }
    >({
      query: (data: { email: string; otp: string; type: string }) => ({
        url: "/auth/verify-otp",
        method: "POST",
        data,
      }),
    }),
    resetPassword: builder.mutation<
      IAuth,
      { email: string; newPassword: string; confirmNewPassword: string }
    >({
      query: (data: {
        email: string;
        newPassword: string;
        confirmNewPassword: string;
      }) => ({
        url: "/auth/reset-password",
        method: "POST",
        data,
      }),
    }),
    changePassword: builder.mutation<
      IAuth,
      { oldPassword: string; newPassword: string }
    >({
      query: (data: { oldPassword: string; newPassword: string }) => ({
        url: "/auth/change-password",
        method: "POST",
        data,
      }),
    }),
    refreshToken: builder.mutation<IAuth, { token: string }>({
      query: (data: { token: string }) => ({
        url: "/auth/refresh-token",
        method: "POST",
        data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSentOTPMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
} = authApi;
