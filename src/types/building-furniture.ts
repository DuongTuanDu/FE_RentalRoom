import type { IBuilding } from "./building";
import type { IFurniture } from "./furniture";

export interface IFurnitureBuilding {
  _id: string;
  buildingId: IBuilding;
  furnitureId: IFurniture;
  quantityPerRoom: number;
  totalQuantity: number;
  status: "active" | "inactive";
  notes: string;
  createdAt: string;
  updatedAt: string;
  totalQuantityActual?: number;
  totalRooms?: number;
  roomsOverridden?: number;
  roomsByDefault?: number;
  __v?: number;
}

export interface IFurnitureBuildingItem {
  furnitureId: string;
  quantityPerRoom: number;
  totalQuantity: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface IFurnitureBuildingRequest {
  buildingId: string;
  items: IFurnitureBuildingItem[];
  mode: "create" | "upsert"; // <-- sửa "update" thành "upsert" để khớp backend
  dryRun: boolean;
}

export interface IFurnitureBuildingRequestUpdate {
  quantityPerRoom: number;
  totalQuantity: number;
  status: "active" | "inactive";
  notes?: string;
}
export type ApplyMode = "set" | "increment";

export interface IApplyToRoomsBody {
  furnitureIds?: string[]; // để trống = tất cả
  roomIds?: string[]; // để trống = tất cả
  floorIds?: string[]; // để trống = tất cả
  mode: ApplyMode; // "set" (ghi đè) | "increment" (cộng dồn)
  overrideQty?: number | null; // null = dùng quantityPerRoom từ tòa
}

export interface IApplyToRoomsRequest {
  buildingId: string;
  body: IApplyToRoomsBody;
}

export interface IApplyToRoomsResponse {
  success?: boolean;
  mode?: ApplyMode;
  overrideQty?: number | null;
  matched?: number;
  modified?: number;
  upserted?: number;
  totalOps?: number;
  // nếu dryRun
  dryRun?: boolean;
  preview?: {
    totalRooms: number;
    totalItems: number; // số loại nội thất active ở tòa
    operations: number; // tổng số upsert/update sẽ chạy
    mode: ApplyMode;
    overrideQty: number | null;
  };
  message?: string;
}

export type FurnitureBuildingResponse = IFurnitureBuilding[];
