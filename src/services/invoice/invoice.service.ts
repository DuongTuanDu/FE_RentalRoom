import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IGenerateInvoiceRequest,
  IGenerateMonthlyInvoiceRequest,
  InvoiceDetailResponse,
  InvoiceResponse,
  IPayInvoiceRequest,
  ITenantInvoiceResponse,
  ITenantInvoiceDetailResponse,
  ITenantPayInvoiceRequest,
} from "@/types/invoice";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Invoice", "TenantInvoice"],
  endpoints: (builder) => ({
    getInvoices: builder.query<
      InvoiceResponse,
      {
        status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
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
    >({ // Tạo hóa đơn tháng cho 1 phòng
      query: (data) => ({
        url: "/landlords/invoices/generate-monthly",
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
      InvoiceResponse,
      { id: string; data: IPayInvoiceRequest }
    >({ // Đánh dáu hóa đơn đã thanh toán
      query: ({ id, data }) => ({
        url: `/landlords/invoices/${id}/pay`,
        method: "POST",
        data,
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

    // Tenant
    getTenantInvoices: builder.query<
      InvoiceResponse,
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
    payTenantInvoice: builder.mutation<ITenantInvoiceResponse, { id: string; data: ITenantPayInvoiceRequest }>({
      query: ({ id, data }) => ({
        url: `/invoices/${id}/pay`,
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

  // Tenant
  useGetTenantInvoicesQuery,
  useGetTenantInvoiceDetailsQuery,
  usePayTenantInvoiceMutation
} = invoiceApi;
