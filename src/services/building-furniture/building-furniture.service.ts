import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IFurnitureBuilding,
  IFurnitureBuildingRequest,
  IFurnitureBuildingRequestUpdate,
  IApplyToRoomsRequest,
  IApplyToRoomsResponse,
} from "@/types/building-furniture";

// Kiểu dữ liệu thực tế trả từ API (aggregation)
type AggRow = {
  _id: string;
  buildingId: string;
  furnitureId: string;
  quantityPerRoom: number;
  status: "active" | "inactive";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  building?: { name?: string; address?: string; description?: string };
  furniture?: { name?: string };
  totalQuantityActual?: number;
  totalRooms?: number;
  roomsOverridden?: number;
  roomsByDefault?: number;
};

// Hàm chuyển từ dữ liệu API sang kiểu FE đang dùng
function toIFurnitureBuilding(r: AggRow): IFurnitureBuilding {
  const roomsOverridden = r.roomsOverridden ?? 0;
  const totalRooms = r.totalRooms ?? 0;
  const roomsByDefault =
    r.roomsByDefault ?? Math.max(0, totalRooms - roomsOverridden);

  return {
    _id: r._id,
    buildingId: {
      _id: r.buildingId,
      name: r.building?.name ?? "",
      address: r.building?.address ?? "",
      description: r.building?.description ?? "",
    } as any,
    furnitureId: {
      _id: r.furnitureId,
      name: r.furniture?.name ?? "",
    } as any,
    quantityPerRoom: r.quantityPerRoom ?? 0,
    totalQuantity: r.totalQuantityActual ?? 0,

    totalQuantityActual: r.totalQuantityActual ?? 0,
    totalRooms,
    roomsOverridden,
    roomsByDefault,

    status: r.status,
    notes: r.notes ?? "",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const buildingFurnitureApi = createApi({
  reducerPath: "buildingFurnitureApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args as any;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["BuildingFurniture"],

  endpoints: (builder) => ({
    // -------- GET LIST ---------
    getBuildingFurnitures: builder.query<
      IFurnitureBuilding[],
      { buildingId?: string }
    >({
      query: ({ buildingId }) => {
        const search = new URLSearchParams();
        if (buildingId) search.set("buildingId", buildingId);
        search.set("withStats", "true"); // luôn bật thống kê
        return {
          url: `/landlords/furnitures/building?${search.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (resp: AggRow[] | { data: AggRow[] }) => {
        const arr = Array.isArray(resp) ? resp : resp?.data ?? [];
        return arr.map(toIFurnitureBuilding);
      },
      providesTags: ["BuildingFurniture"],
    }),

    // -------- CREATE (BULK) ---------
    createBuildingFurniture: builder.mutation<any, IFurnitureBuildingRequest>({
      query: (data) => ({
        url: "/landlords/furnitures/building/bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),

    // -------- UPDATE ---------
    updateBuildingFurniture: builder.mutation<
      any,
      { id: string; data: IFurnitureBuildingRequestUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/landlords/furnitures/building/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),

    // -------- DELETE ---------
    deleteBuildingFurniture: builder.mutation<any, string>({
      query: (id) => ({
        url: `/landlords/furnitures/building/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BuildingFurniture"],
    }),
    // -------- APPLY TO ROOMS ---------
    applyBuildingFurnitureToRooms: builder.mutation<
      IApplyToRoomsResponse,
      IApplyToRoomsRequest
    >({
      query: ({ buildingId, body }) => ({
        url: `/landlords/furnitures/${buildingId}/apply-to-rooms`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["BuildingFurniture"], // để list cập nhật lại
    }),
  }),
});

export const {
  useGetBuildingFurnituresQuery,
  useCreateBuildingFurnitureMutation,
  useUpdateBuildingFurnitureMutation,
  useDeleteBuildingFurnitureMutation,
  useApplyBuildingFurnitureToRoomsMutation,
} = buildingFurnitureApi;
