import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContractCreateResponse,
  IContractDetailResponse,
  IContractResponse,
  IRequestExtendRequest,
  ITenantContractResponse,
  IUpdateContractRequest,
  IUpdateTenantContractRequest,
} from "@/types/contract";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Contract", "TenantContract"],
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

    // Tenant
    getTenantContracts: builder.query<ITenantContractResponse, {
      page?: number;
      limit?: number;
      status?:
        | "draft"
        | "sent_to_tenant"
        | "signed_by_tenant"
        | "signed_by_landlord"
        | "completed";
    }>({
      query: ({ page = 1, limit = 10, status  }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) {
          params.append("status", status);
        }

        return {
          url: `/contracts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TenantContract"],
    }),
    getTenantContractDetails: builder.query<IContractDetailResponse, string>({
      query: (id) => ({
        url: `/contracts/${id}`,
        method: "GET",
      }),
      providesTags: ["TenantContract"],
    }),
    updateTenantContract: builder.mutation<
      ITenantContractResponse,
      { id: string; data: IUpdateTenantContractRequest }
    >({
      query: ({ id, data }) => ({
        url: `/contracts/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["TenantContract"],
    }),
    signTenant: builder.mutation<
      IContractResponse,
      { id: string; data: { signatureUrl: string } }
    >({
      // Người thuê ký hợp đồng
      query: ({ id, data }) => ({
        url: `/contracts/${id}/sign`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["TenantContract"],
    }),
    getUpcomingExpire: builder.query<IContractResponse, { // Danh sách hợp đồng sắp hết hạn của người thuê
      days?: number
      page?: number;
      limit?: number;
    }>({
      query: ({ page = 1, limit = 10, days  }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (days) {
          params.append("days", days.toString());
        }

        return {
          url: `/contracts/upcoming-expire?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TenantContract"],
    }),
    requestExtend: builder.mutation<IContractResponse, { id: string, data: IRequestExtendRequest }>({
      // Người thuê gửi yêu cầu gia hạn hợp đồng
      query: ({ id, data }) => ({
        url: `/contracts/${id}/request-extend`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["TenantContract"],
    })
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

  // Tenant
  useGetTenantContractsQuery,
  useGetTenantContractDetailsQuery,
  useUpdateTenantContractMutation,
  useSignTenantMutation,
  useGetUpcomingExpireQuery,
  useRequestExtendMutation
} = contractApi;
