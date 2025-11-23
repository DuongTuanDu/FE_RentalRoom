import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  InvoiceDetailResponse,
  InvoiceResponse,
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
        status?: "draft" | "confirmed" | "billed";
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
    })
  }),
});

export const {
  useGetInvoicesQuery,
} = invoiceApi;
