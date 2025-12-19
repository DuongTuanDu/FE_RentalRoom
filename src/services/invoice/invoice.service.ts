import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IGenerateInvoiceRequest,
  IGenerateMonthlyInvoiceRequest,
  InvoiceDetailResponse,
  InvoiceResponse,
  ITenantInvoiceResponse,
  ITenantInvoiceDetailResponse,
  ITenantPayInvoiceRequest,
  IRoomCompletedContractResponse,
  IUpdateInvoiceRequest,
  ISendDraftInvoiceRequest,
  IInvoicePaymentInfoResponse,
  IRequestTransferConfirmation,
  InvoiceHistoryResponse,
  CreateInvoiceReplaceRequest,
} from "@/types/invoice";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Invoice", "TenantInvoice", "InvoiceHistory"],
  endpoints: (builder) => ({
    getInvoices: builder.query<
      InvoiceResponse,
      {
        status?: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "replaced";
        buildingId?: string;
        roomId?: string;
        tenantId?: string;
        periodMonth?: string;
        periodYear?: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({
        status,
        buildingId,
        roomId,
        tenantId,
        periodMonth,
        periodYear,
        page = 1,
        limit = 10,
        search = "",
      }) => ({
        url: "/landlords/invoices",
        method: "GET",
        params: {
          page,
          limit,
          search,
          ...(buildingId ? { buildingId } : {}),
          ...(roomId ? { roomId } : {}),
          ...(tenantId ? { tenantId } : {}),
          ...(status ? { status } : {}),
          ...(periodMonth ? { periodMonth } : {}),
          ...(periodYear ? { periodYear } : {}),
        },
      }),
      providesTags: ["Invoice"],
    }),
    getInvoiceDetails: builder.query<InvoiceDetailResponse, string>({
      query: (id) => ({
        url: `/landlords/invoices/${id}`,
        method: "GET",
      }),
      providesTags: ["Invoice"],
    }),
    createGenerateMonthlyInvoice: builder.mutation<
      InvoiceResponse,
      IGenerateMonthlyInvoiceRequest
    >({ // Tạo hóa đơn tháng hàng loạt cho các phòng đang được thuê
      query: (data) => ({
        url: "/landlords/invoices/generate-monthly-bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    createGenerateInvoice: builder.mutation<
      InvoiceResponse,
      IGenerateInvoiceRequest
    >({ // Tạo hóa đơn tùy chỉnh từ danh sách items
      query: (data) => ({
        url: "/landlords/invoices/generate",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    payInvoice: builder.mutation<
      IInvoicePaymentInfoResponse,
      string
    >({ // Đánh dáu hóa đơn đã thanh toán
      query: (id) => ({
        url: `/landlords/invoices/${id}/pay`,
        method: "POST",
      }),
      invalidatesTags: ["Invoice"],
    }),
    sendInvoice: builder.mutation<InvoiceResponse, string>({ // Gửi hóa đơn cho người thuê qua email
      query: (id) => ({
        url: `/landlords/invoices/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: ["Invoice"],
    }),
    getRoomsCompletedContract: builder.query<IRoomCompletedContractResponse, { // Danh sách phòng đang có hợp đồng complete trong kỳ để tạo hóa đơn
      buildingId?: string;
      roomId?: string;
      page?: number;
      limit?: number;
    }>({
      query: ({ buildingId, roomId, page = 1, limit = 10 }) => ({
        url: "/landlords/invoices/rooms",
        method: "GET",
        params: {
          page,
          limit,
          ...(buildingId ? { buildingId } : {}),
          ...(roomId ? { roomId } : {}),
        },
      }),
      providesTags: ["Invoice"],
    }),
    updateInvoice: builder.mutation<InvoiceResponse, { id: string, data: IUpdateInvoiceRequest }>({
      query: ({ id, data }) => ({
        url: `/landlords/invoices/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Invoice", "InvoiceHistory"],
    }),
    sendDraftAllInvoices: builder.mutation<InvoiceResponse, ISendDraftInvoiceRequest>({ // Gửi tất cả hóa đơn đang draft cho người thuê qua email
      query: (data) => ({
        url: `/landlords/invoices/send-drafts`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    deleteInvoice: builder.mutation<InvoiceResponse, string>({ //Chỉ xóa được hóa đơn draft
      query: (id) => ({
        url: `/landlords/invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice"],
    }),
    historyUpdateInvoice: builder.query<InvoiceHistoryResponse, string>({ // Lịch sử cập nhật hóa đơn
      query: (id) => ({
        url: `/landlords/invoices/${id}/history`,
        method: "GET",
      }),
      providesTags: ["InvoiceHistory"],
    }),
    replaceInvoice: builder.mutation<InvoiceResponse, { id: string, data: CreateInvoiceReplaceRequest }>({ // Tạo hóa đơn mới thay thế từ hóa đơn cũ
      // Chỉ cho phép thay thế khi hóa đơn trạng thái hiện tại là sent
      query: ({ id, data }) => ({
        url: `/landlords/invoices/${id}/replace`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Invoice"],
    }),

    // Tenant
    getTenantInvoices: builder.query<
      ITenantInvoiceResponse,
      {
        status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
        periodMonth?: string;
        periodYear?: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({
        status,
        periodMonth,
        periodYear,
        page = 1,
        limit = 10,
        search = "",
      }) => ({
        url: "/invoices",
        method: "GET",
        params: {
          page,
          limit,
          search,
          ...(status ? { status } : {}),
          ...(periodMonth ? { periodMonth } : {}),
          ...(periodYear ? { periodYear } : {}),
        },
      }),
      providesTags: ["TenantInvoice"],
    }),
    getTenantInvoiceDetails: builder.query<ITenantInvoiceDetailResponse, string>({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: "GET",
      }),
    }),
    payTenantInvoice: builder.mutation<IInvoicePaymentInfoResponse, { id: string; data: ITenantPayInvoiceRequest }>({
      query: ({ id, data }) => ({
        url: `/invoices/${id}/pay`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["TenantInvoice"],
    }),
    requestTransferConfirmation: builder.mutation<IInvoicePaymentInfoResponse, { id: string; data: IRequestTransferConfirmation }>({
      query: ({ id, data }) => ({ // Người thuê gửi yêu cầu xác nhận đã chuyển khoản
        url: `/invoices/${id}/request-transfer-confirmation`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["TenantInvoice"],
    })
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceDetailsQuery,
  useCreateGenerateMonthlyInvoiceMutation,
  useCreateGenerateInvoiceMutation,
  usePayInvoiceMutation,
  useSendInvoiceMutation,
  useGetRoomsCompletedContractQuery,
  useUpdateInvoiceMutation,
  useSendDraftAllInvoicesMutation,
  useDeleteInvoiceMutation,
  useHistoryUpdateInvoiceQuery,
  useReplaceInvoiceMutation,

  // Tenant
  useGetTenantInvoicesQuery,
  useGetTenantInvoiceDetailsQuery,
  usePayTenantInvoiceMutation,
  useRequestTransferConfirmationMutation
} = invoiceApi;
