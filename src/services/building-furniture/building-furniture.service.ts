import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  FurnitureBuildingResponse,
  IFurnitureBuildingRequest,
  IFurnitureBuildingRequestUpdate,
} from "@/types/building-furniture";

export const buildingFurnitureApi = createApi({
  reducerPath: "buildingFurnitureApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["BuildingFurniture"],
  endpoints: (builder) => ({
    getBuildingFurnitures: builder.query<
      FurnitureBuildingResponse,
      {
        buildingId?: string;
      }
    >({
      query: ({ buildingId }) => {
        const params = new URLSearchParams({
          buildingId: buildingId || "",
        });
        return {
          url: `/furnitures/building?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BuildingFurniture"],
    }),
    createBuildingFurniture: builder.mutation<
      FurnitureBuildingResponse,
      IFurnitureBuildingRequest
    >({
      query: (data) => ({
        url: "/furnitures/building/bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),
    updateBuildingFurniture: builder.mutation<
      FurnitureBuildingResponse,
      { id: string; data: IFurnitureBuildingRequestUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/furnitures/building/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),
    deleteBuildingFurniture: builder.mutation<FurnitureBuildingResponse, string>({
      query: (id) => ({
        url: `/furnitures/building/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),
  }),
});

export const {
  useGetBuildingFurnituresQuery,
  useCreateBuildingFurnitureMutation,
  useUpdateBuildingFurnitureMutation,
  useDeleteBuildingFurnitureMutation,
} = buildingFurnitureApi;
