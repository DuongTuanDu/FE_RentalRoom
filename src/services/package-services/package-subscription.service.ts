import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  ISubscriptionResponse,
  ICreateSubscriptionRequest,
  ICreateSubscriptionResponse,
} from "@/types/package-subscription";

export const packageSubscriptionApi = createApi({
  reducerPath: "packageSubscriptionApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["PackageSubscription"],
  endpoints: (builder) => ({
    getMySubscriptions: builder.query<ISubscriptionResponse, void>({
      query: () => ({
        url: "/subscriptions/history",
        method: "GET",
      }),
      providesTags: ["PackageSubscription"],
    }),

    // mua gói dịch vụ -> trả về URL thanh toán VNPay
    buySubscription: builder.mutation<
      ICreateSubscriptionResponse,
      ICreateSubscriptionRequest
    >({
      query: (data) => ({
        url: "/subscriptions/buy",
        method: "POST",
        data,
      }),
      invalidatesTags: ["PackageSubscription"],
    }),

    // xử lý callback từ VNPay
    handleVNPayReturn: builder.query<any, { params: Record<string, string> }>({
      query: ({ params }) => ({
        url: "/subscriptions/return",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetMySubscriptionsQuery,
  useBuySubscriptionMutation,
  useHandleVNPayReturnQuery,
} = packageSubscriptionApi;
