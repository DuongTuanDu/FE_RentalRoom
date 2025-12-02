import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  CreateBuildingRequest,
  CreateBuildingResponse,
  CreateQuickBuildingRequest,
  IBuilding,
  IBuildingResponse,
} from "@/types/building";

export interface ImportExcelResult {
  message: string;
  results?: {
    buildingsCreated: number;
    floorsCreated: number;
    roomsCreated: number;
    duplicates?: string[];
    errors?: string[];
  };
}

export const buildingApi = createApi({
  reducerPath: "buildingApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["Building"],
  endpoints: (builder) => ({
    getBuildings: builder.query<
      IBuildingResponse,
      {
        q?: string;
        page?: number;
        limit?: number;
        status?: "active" | "inactive";
      }
    >({
      query: ({ page = 1, limit = 10, q = "", status }) => ({
        url: "/landlords/buildings",
        method: "GET",
        params: { page, limit, q, ...(status ? { status } : {}) },
      }),
      providesTags: ["Building"],
    }),

    getBuildingById: builder.query<IBuilding, string>({
      query: (buildingId) => ({
        url: `/landlords/buildings/${buildingId}`,
        method: "GET",
      }),
      providesTags: ["Building"],
    }),

    createBuilding: builder.mutation<
      CreateBuildingResponse,
      CreateBuildingRequest
    >({
      query: (data) => ({ url: "/landlords/buildings", method: "POST", data }),
      invalidatesTags: ["Building"],
    }),

    updateBuilding: builder.mutation<
      CreateBuildingResponse,
      { id: string; data: Partial<CreateBuildingRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/buildings/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Building"],
    }),

    deleteBuilding: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/landlords/buildings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Building"],
    }),

    createQuickBuilding: builder.mutation<
      CreateBuildingResponse,
      CreateQuickBuildingRequest
    >({
      query: (data) => ({
        url: "/landlords/buildings/quick-setup",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Building"],
    }),

    updateStatus: builder.mutation<
      CreateBuildingResponse,
      { id: string; status: "active" | "inactive" }
    >({
      query: ({ id, status }) => ({
        url: `/landlords/buildings/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Building"],
    }),

    /** Tải file Excel template (trả về Blob) */
    downloadImportTemplate: builder.mutation<Blob, void>({
      query: () => ({
        url: "/landlords/buildings/import-template",
        method: "GET",
        // dùng config để set responseType (đã hỗ trợ trong baseQuery)
        config: { responseType: "blob" },
      }),
    }),

    /** Import từ Excel (multipart/form-data) */
    importFromExcel: builder.mutation<ImportExcelResult, FormData>({
      query: (formData) => ({
        url: "/landlords/buildings/import-excel",
        method: "POST",
        data: formData, // baseQuery đã tự nhận biết FormData và set header phù hợp
      }),
      invalidatesTags: ["Building"],
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useGetBuildingByIdQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  useCreateQuickBuildingMutation,
  useUpdateStatusMutation,
  useDownloadImportTemplateMutation,
  useImportFromExcelMutation,
} = buildingApi;
