import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContractCreateResponse,
  IContractDetailResponse,
  IContractResponse,
  IRequestExtendRequest,
  IRequestTerminateRequest,
  ITenantContractDetailResponse,
  ITenantContractResponse,
  ITerminateContractRequest,
  IUpdateContractRequest,
  IUpdateTenantContractRequest,
} from "@/types/contract";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["Contract", "TenantContract", "ContractRenewal"],
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
          | "completed"
          | "voided"
          | "terminated";
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
      // Chỉ cho phép khi hợp đồng ở trạng thái completed
      query: ({ id }) => ({
        url: `/landlords/contracts/${id}/confirm-move-in`,
        method: "POST",
      }),
      invalidatesTags: ["Contract"],
    }),
    deleteContract: builder.mutation<IContractResponse, string>({ // chỉ cho phép xóa khi đang bản nháp (draft)
      query: (id) => ({
        url: `/landlords/contracts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contract"],
    }),
    getRenewalRequests: builder.query<IContractResponse, { // Lấy danh sách hợp đồng có yêu cầu gia hạn
      buildingId?: string;
      status?: "pending" | "approved" | "rejected" | "cancelled";
      page?: number;
      limit?: number;
    }>({
      query: ({ buildingId, status, page = 1, limit = 10 }) => ({
        url: `/landlords/contracts/renewal-requests`,
        method: "GET",
        params: {
          page,
          limit,
          ...(buildingId ? { buildingId } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["ContractRenewal"],
    }),
    approveExtension: builder.mutation<IContractResponse, { id: string; data: { note: string } }>({
      // Chủ trọ phê duyệt yêu cầu gia hạn hợp đồng
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/approve-extension`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    rejectExtension: builder.mutation<IContractResponse, { id: string; data: { reason: string } }>({
      // Chủ trọ từ chối yêu cầu gia hạn hợp đồng
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/reject-extension`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    terminateContract: builder.mutation<IContractResponse, { id: string; data: ITerminateContractRequest }>({
      // Chấm dứt hợp đồng trước hạn
      // Chỉ cho phép khi hợp đồng đã ở trạng thái completed và đã xác nhận người thuê vào ở
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/terminate`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    disableContract: builder.mutation<IContractResponse, { id: string, data: { reason: string } }>({
      // Vô hiệu hóa hợp đồng
      // Chỉ cho phép khi hợp đồng ở trạng thái completed, sent_to_tenant và chưa xác nhận người thuê vào ở
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/void`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    downloadContract: builder.mutation<Blob, { id: string }>({
      // Tải file pdf hợp đồng
      // Chỉ cho phép khi trạng thái hợp đồng là completed
      query: ({ id }) => ({
        url: `/landlords/contracts/${id}/download`,
        method: "GET",
        config: { responseType: "blob" },
      }),
    }),
    createCloneContract: builder.mutation<IContractResponse, { id: string }>({
      // Tạo hợp đồng mới (draft) từ hợp đồng có cũ
      // Clone hợp đồng ở trạng thái completed hoặc voided sang một hợp đồng mới ở trạng thái draft để sửa lại thông tin và ký lại.
      query: ({ id }) => ({
        url: `/landlords/contracts/${id}/clone`,
        method: "POST",
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    approveTerminateContract: builder.mutation<IContractResponse, string>({
      // Chủ trọ phê duyệt yêu cầu chấm dứt hợp đồng từ tenant
      // Chỉ duyệt được khi status = pending
      query: (id) => ({
        url: `/landlords/contracts/${id}/approve-terminate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
    }),
    rejectTerminateContract: builder.mutation<IContractResponse, { id: string; data: { rejectedReason: string } }>({
      // Chủ trọ từ chối yêu cầu chấm dứt hợp đồng từ tenant
      // Chỉ từ chối được khi status = pending
      query: ({ id, data }) => ({
        url: `/landlords/contracts/${id}/reject-terminate`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Contract", "ContractRenewal"],
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
        | "completed"
        | "voided"
        | "terminated";
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
    getTenantContractDetails: builder.query<ITenantContractDetailResponse, string>({
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
    }),
    downloadTenantContract: builder.mutation<Blob, { id: string }>({
      // Tải file pdf hợp đồng
      // Chỉ cho phép khi trạng thái hợp đồng là completed
      query: ({ id }) => ({
        url: `/contracts/${id}/download`,
        method: "GET",
        config: { responseType: "blob" },
      }),
    }),
    requestTerminate: builder.mutation<IContractResponse, { id: string, data: IRequestTerminateRequest }>({ // Người thuê gửi yêu cầu chấm dứt hợp đồng
      // Chỉ được gửi khi: Hợp đồng ở trạng thái completed (đang hiệu lực)
      query: ({ id, data }) => ({
        url: `/contracts/${id}/request-terminate`,
        method: "PATCH",
        data
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
  useDeleteContractMutation,
  useGetRenewalRequestsQuery,
  useApproveExtensionMutation,
  useRejectExtensionMutation,
  useTerminateContractMutation,
  useDisableContractMutation,
  useDownloadContractMutation,
  useCreateCloneContractMutation,
  useApproveTerminateContractMutation,
  useRejectTerminateContractMutation,

  // Tenant
  useGetTenantContractsQuery,
  useGetTenantContractDetailsQuery,
  useUpdateTenantContractMutation,
  useSignTenantMutation,
  useGetUpcomingExpireQuery,
  useRequestExtendMutation,
  useDownloadTenantContractMutation,
  useRequestTerminateMutation
} = contractApi;
