import type { IBuilding } from "./building";
import type { IFurniture } from "./furniture";

export interface IFurnitureBuilding {
  _id: string;
  buildingId: IBuilding;
  furnitureId: IFurniture;
  quantityPerRoom: number;
  totalQuantity: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  mode: "create" | "update";
  dryRun: boolean;
}

export interface IFurnitureBuildingRequestUpdate {
  quantityPerRoom: number;
  totalQuantity: number;
  status: "active" | "inactive";
  notes?: string;
}

export type FurnitureBuildingResponse = IFurnitureBuilding[];
