import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContractCreateResponse,
  IContractDetailResponse,
  IContractResponse,
  IUpdateContractRequest,
} from "@/types/contract";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Contract"],
  endpoints: (builder) => ({
    getContracts: builder.query<
      IContractResponse,
      {
        page?: number;
        limit?: number;
        status?:
          | "draft"
          | "sent_to_tenant"
          | "signed_by_tenant"
          | "signed_by_landlord"
          | "completed";
        search?: string;
      }
    >({
      query: ({ page = 1, limit = 10, status, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) {
          params.append("status", status);
        }
        if (search) {
          params.append("search", search);
        }

        return {
          url: `/landlords/contracts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Contract"],
    }),
    createContract: builder.mutation<
      IContractCreateResponse,
      { contactId: string }
    >({
      query: (data) => ({
        url: "/landlords/contracts/from-contact",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract"],
    }),
    updateContract: builder.mutation<
      IContractResponse,
      { id: string; data: IUpdateContractRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Contract"],
    }),
    getContractDetails: builder.query<IContractDetailResponse, string>({
      query: (id) => ({
        url: `/landlords/contracts/${id}`,
        method: "GET",
      }),
      providesTags: ["Contract"],
    }),
    signLandlord: builder.mutation<
      IContractResponse,
      { id: string; data: { signatureUrl: string } }
    >({
      // Lưu trữ ký của chủ trọ và đánh dấu đã ký của chủ trọ
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/sign-landlord`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract"],
    }),
    sendToTenant: builder.mutation<IContractResponse, { id: string }>({
      // Gửi hợp đồng nội bộ tới tenant
      query: ({ id }) => ({
        url: `/landlords/contracts/${id}/send-to-tenant`,
        method: "POST",
      }),
      invalidatesTags: ["Contract"],
    }),
    confirmMoveIn: builder.mutation<IContractResponse, { id: string }>({
      // Xác nhận người thuê đã vào ở
      query: ({ id }) => ({
        url: `/landlords/contracts/${id}/confirm-move-in`,
        method: "POST",
      }),
      invalidatesTags: ["Contract"],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useGetContractDetailsQuery,
  useSignLandlordMutation,
  useSendToTenantMutation,
  useConfirmMoveInMutation,
} = contractApi;
