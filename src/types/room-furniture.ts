import type { IFurniture } from "./furniture";
import type { IRoom } from "./room";

export interface IFurnitureRoom {
  _id: string;
  roomId: IRoom;
  furnitureId: IFurniture;
  quantity: number;
  condition: "good" | "damaged" | "under_repair";
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IFurnitureRoomRequest {
  roomId: string;
  furnitureId: string;
  quantity: number;
  condition: "good" | "damaged" | "under_repair";
  notes?: string;
}

export interface IFurnitureRoomRequestUpdate {
  quantity: number;
  condition: "good" | "damaged" | "under_repair";
  status: "active" | "inactive";
  notes?: string;
}

export type IFurnitureRoomResponse = IFurnitureRoom[];
