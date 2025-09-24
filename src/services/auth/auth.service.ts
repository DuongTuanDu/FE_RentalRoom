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
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setLogin(data));
        } catch (error) {
          console.log(error);
        }
      },
    })
  }),
});

export const { useLoginMutation } = authApi;
