// src/services/contractTemplate.api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContractTemplate,
  IContractTemplateCreateRequest,
  IContractTemplateResponse,
  IContractTemplateUpdateRequest,
} from "@/types/contract";

const saveBlob = (blob: Blob, filename = "contract.pdf") => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const getFilenameFromDisposition = (disposition?: string) => {
  if (!disposition) return undefined;
  // ví dụ: attachment; filename="Mau_Hop_Dong.pdf"
  const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  if (m?.[1]) return decodeURIComponent(m[1]);
  return undefined;
};

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

    downloadContractTemplatePdfById: builder.mutation<
      void,
      { id: string; filename?: string }
    >({
      queryFn: async ({ id, filename }, _api, _extra, fetchWithBQ) => {
        const res: any = await fetchWithBQ({
          url: `/landlords/contract-templates/${id}/pdf`,
          method: "GET",
          responseType: "blob", // quan trọng
          // Nếu dùng cookie auth thì không cần headers;
          // nếu dùng Bearer thì thêm: config: { headers: { Authorization: `Bearer ${token}` } }
        });

        if (res.error) return { error: res.error as any };

        const blob: Blob = res.data as Blob;
        const disposition = (res.meta as any)?.response?.headers?.get?.(
          "content-disposition"
        );
        const inferred =
          filename || getFilenameFromDisposition(disposition) || "contract.pdf";

        saveBlob(blob, inferred);
        return { data: undefined };
      },
    }),

    downloadContractTemplatePdfByBuilding: builder.mutation<
      void,
      { buildingId: string; filename?: string }
    >({
      queryFn: async ({ buildingId, filename }, _api, _extra, fetchWithBQ) => {
        const res: any = await fetchWithBQ({
          url: `/landlords/contract-templates/by-building/${buildingId}/pdf`,
          method: "GET",
          responseType: "blob",
        });

        if (res.error) return { error: res.error as any };

        const blob: Blob = res.data as Blob;
        const disposition = (res.meta as any)?.response?.headers?.get?.(
          "content-disposition"
        );
        const inferred =
          filename || getFilenameFromDisposition(disposition) || "contract.pdf";

        saveBlob(blob, inferred);
        return { data: undefined };
      },
    }),
  }),
});

export const {
  useGetContractTemplatesQuery,
  useCreateContractTemplateMutation,
  useUpdateContractTemplateMutation,
  useDeleteContractTemplateMutation,
  useDownloadContractTemplatePdfByIdMutation,
  useDownloadContractTemplatePdfByBuildingMutation,
} = contractTemplateApi;
