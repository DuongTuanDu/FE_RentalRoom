import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { FurnitureResponse, IFurnitureRequest } from "@/types/furniture";

export const furnitureApi = createApi({
    reducerPath: "furnitureApi",
    baseQuery: async (args) => {
        const { url, method, data, params } = args;
        return baseQuery({ url, method, data, params });
    },
    tagTypes: ["Furniture"],
    endpoints: (builder) => ({
        getFurnitures: builder.query<FurnitureResponse, void>({
            query: () => {
                return {
                    url: "/furnitures",
                    method: "GET",
                };
            },
            providesTags: ["Furniture"],
        }),
        createFurniture: builder.mutation<FurnitureResponse, IFurnitureRequest>({
            query: (data) => ({
                url: "/furnitures",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Furniture"],
        }),
        updateFurniture: builder.mutation<FurnitureResponse, {id: string; data: IFurnitureRequest}>({
            query: ({id, data}) => ({
                url: `/furnitures/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["Furniture"],
        }),
        deleteFurniture: builder.mutation<FurnitureResponse, string>({
            query: (id) => ({
                url: `/furnitures/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Furniture"],
        }),
    }),
});

export const { useGetFurnituresQuery, useCreateFurnitureMutation, useUpdateFurnitureMutation, useDeleteFurnitureMutation } = furnitureApi;
