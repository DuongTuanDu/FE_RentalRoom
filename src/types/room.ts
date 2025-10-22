// types/room.ts

export interface IRoom {
  id: string;
  buildingId: {
    _id: string;
    name: string;
    address: string;
    description: string;
    ePrice: number;
    wPrice: number;
  };
  floorId: {
    _id: string;
    level: number;
  };
  roomNumber: string;
  area: number;
  price: number;
  maxTenants: number;
  status: "available" | "rented" | "maintenance";
  description: string;
  images?: string[];
  isDeleted: boolean;
  deletedAt: string | null;
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
  images?: File[];
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
    images?: File[];
    removeUrls?: string[];
    replaceAllImages?: boolean;
  }>;
}