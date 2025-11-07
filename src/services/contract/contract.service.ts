// src/services/contractTemplate.api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContractTemplate,
  IContractTemplateCreateRequest,
  IContractTemplateResponse,
  IContractTemplateUpdateRequest,
} from "@/types/contract";

export const contractTemplateApi = createApi({
  reducerPath: "contractTemplateApi",
  baseQuery: async (args) => {
    const { url, method, data, params, responseType, config } = args as any;
    return baseQuery({ url, method, data, params, responseType, config });
  },
  tagTypes: ["ContractTemplate"],
  endpoints: (builder) => ({
    getContractTemplates: builder.query<IContractTemplateResponse, void>({
      query: () => ({ url: "/landlords/contract-templates", method: "GET" }),
      providesTags: ["ContractTemplate"],
    }),
    createContractTemplate: builder.mutation<
      IContractTemplate,
      IContractTemplateCreateRequest
    >({
      query: (data) => ({
        url: "/landlords/contract-templates",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ContractTemplate"],
    }),
    updateContractTemplate: builder.mutation<
      IContractTemplate,
      { id: string; data: IContractTemplateUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/contract-templates/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["ContractTemplate"],
    }),
    deleteContractTemplate: builder.mutation<IContractTemplateResponse, string>(
      {
        query: (id) => ({
          url: `/landlords/contract-templates/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ContractTemplate"],
      }
    ),
    getPreviewContractPdf: builder.query<
      Blob,
      {
        buildingId: string;
        termIds?: string[];
        regulationIds?: string[];
        fileName?: string;
      }
    >({
      query: ({ buildingId, termIds = [], regulationIds = [], fileName }) => ({
        url: "/landlords/contract-templates/preview-pdf",
        method: "GET",
        params: {
          buildingId,
          fileName,
          // gửi mảng như ?termIds=...&termIds=...
          ...(termIds.length ? { termIds } : {}),
          ...(regulationIds.length ? { regulationIds } : {}),
        },
        responseType: "blob",
      }),
    }),
  }),
});

export const {
  useGetContractTemplatesQuery,
  useCreateContractTemplateMutation,
  useUpdateContractTemplateMutation,
  useDeleteContractTemplateMutation,
  useLazyGetPreviewContractPdfQuery,
} = contractTemplateApi;
