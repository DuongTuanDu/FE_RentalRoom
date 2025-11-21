import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  ISubscriptionResponse,
  ICreateSubscriptionRequest,
  ICreateSubscriptionResponse,
  ISubscription,
  startTrialSubscriptionResponse,
  IRenewSubscriptionResponse,
  ICurrentSubscriptionResponse,
  IDetailSubscriptionResponse,
  ICancelSubscriptionResponse,
} from "@/types/package-subscription";

export const packageSubscriptionApi = createApi({
  reducerPath: "packageSubscriptionApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["PackageSubscription"],
  endpoints: (builder) => ({
    getMySubscriptions: builder.query<ISubscription[], void>({
      query: () => ({
        url: "/subscriptions/history",
        method: "GET",
      }),
      transformResponse: (response: ISubscriptionResponse) => {
        return response?.data?.data || [];
      },
      providesTags: ["PackageSubscription"],
    }),

    startTrialSubscription: builder.mutation<startTrialSubscriptionResponse, void>({
      query: () => ({
        url: "/subscriptions/start-trial",
        method: "POST",
      }),
      invalidatesTags: ["PackageSubscription"],
    }),

    renewSubscription: builder.mutation<IRenewSubscriptionResponse, void>({
      query: () => ({
        url: `/subscriptions/renew`,
        method: "POST",
      }),
      invalidatesTags: ["PackageSubscription"],
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

    currentSubscription: builder.query<ICurrentSubscriptionResponse | null, void>({
      query: () => ({
        url: "/subscriptions/current",
        method: "GET",
      }),
      transformResponse: (response: ICurrentSubscriptionResponse) => {
        return response || null;
      },
      providesTags: ["PackageSubscription"],
    }),

    detailSubscription: builder.query<IDetailSubscriptionResponse | null, string>({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}`,
        method: "GET",
      }),
      transformResponse: (response: IDetailSubscriptionResponse) => {
        return response || null;
      },
      providesTags: ["PackageSubscription"], 
    }),

    cancelSubscription: builder.mutation<ICancelSubscriptionResponse, void>({
      query: () => ({
        url: `/subscriptions/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["PackageSubscription"],
    }),
  }),
});

export const {
  useGetMySubscriptionsQuery,
  useBuySubscriptionMutation,
  useHandleVNPayReturnQuery,
  useDetailSubscriptionQuery,
  useStartTrialSubscriptionMutation,
  useRenewSubscriptionMutation,
  useCurrentSubscriptionQuery,
  useCancelSubscriptionMutation,
} = packageSubscriptionApi;
