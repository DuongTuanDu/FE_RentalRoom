import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IFurnitureResponse, IFurnitureRequest } from "@/types/furniture";

export const furnitureApi = createApi({
  reducerPath: "furnitureApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Furniture"],
  endpoints: (builder) => ({
    getFurnitures: builder.query<IFurnitureResponse, void>({
      query: () => {
        return {
          url: "/landlords/furnitures",
          method: "GET",
        };
      },
      providesTags: ["Furniture"],
    }),
    createFurniture: builder.mutation<IFurnitureResponse, IFurnitureRequest>({
      query: (data) => ({
        url: "/landlords/furnitures",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Furniture"],
    }),
    updateFurniture: builder.mutation<
      IFurnitureResponse,
      { id: string; data: IFurnitureRequest }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/furnitures/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Furniture"],
    }),
    deleteFurniture: builder.mutation<IFurnitureResponse, string>({
      query: (id) => ({
        url: `/landlords/furnitures/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Furniture"],
    }),
  }),
});

export const { useGetFurnituresQuery, useCreateFurnitureMutation, useUpdateFurnitureMutation, useDeleteFurnitureMutation } = furnitureApi;
