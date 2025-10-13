// types/room.ts

export interface IRoom {
  id: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  area: number;
  price: number;
  maxTenants: number;
  status: "available" | "rented" | "maintenance";
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRoomListResponse {
  data: IRoom[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRoomRequest {
  buildingId: string;
  floorId: string;
  roomNumber: string;
  area: number;
  price: number;
  maxTenants: number;
  status: "available" | "rented" | "maintenance";
  description?: string;
}

export interface UpdateRoomRequest {
  id: string;
  data: Partial<{
    roomNumber: string;
    area: number;
    price: number;
    maxTenants: number;
    status: "available" | "rented" | "maintenance";
    description: string;
  }>;
}