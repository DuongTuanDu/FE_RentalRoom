import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { GetPackagesResponse, IPackage } from "@/types/package-services";

export interface CreatePackageRequest {
  name: string;
  price: number;
  durationDays: number;
  roomLimit: number;
  description?: string;
}

export const packageServicesApi = createApi({
  reducerPath: "packageServicesApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["PackageServices"],
  endpoints: (builder) => ({
    getPackageServices: builder.query<GetPackagesResponse, void>({
      query: () => ({
        url: "/admin/packages/packages",
        method: "GET",
      }),
      providesTags: ["PackageServices"],
    }),

    createPackage: builder.mutation<{ success: boolean; data: IPackage }, CreatePackageRequest>({
      query: (data) => ({
        url: "/admin/packages",
        method: "POST",
        data,
      }),
      invalidatesTags: ["PackageServices"],
    }),

    updatePackage: builder.mutation<
      { success: boolean; data: IPackage },
      { id: string; data: Partial<CreatePackageRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/packages/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["PackageServices"],
    }),

    deletePackage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/packages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PackageServices"],
    }),
  }),
});

export const {
  useGetPackageServicesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageServicesApi;