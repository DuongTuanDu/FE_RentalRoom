// types/room.ts

export interface IRoom {
  _id: string;
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
  images?: File[]; // File objects
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
    images?: File[]; // File objects
    removeUrls?: string[];
    replaceAllImages?: boolean;
  }>;
}

export interface IQuickCreateRoomRequest {
  buildingId: string;
  floorId: string;
  perFloor: number;
  seqStart: number;
  defaults: {
    price: number;
    area: number;
    maxTenants: number;
    status: "available" | "rented" | "maintenance";
    description?: string;
  };
}

export interface IVacantRoomResponse {
  success: boolean;
  data: {
    building: {
      _id: string;
      name: string;
      address: string;
      eIndexType: "byNumber" | "byPerson" | "included";
      ePrice: number;
      wIndexType: "byNumber" | "byPerson" | "included";
      wPrice: number;
      status: "active" | "inactive";
    };
    rooms: {
      _id: string;
      floorId: string;
      roomNumber: string;
      area: number;
      price: number;
    }[];
    services: {
      _id: string;
      name: string;
      label: string;
      description: string;
      chargeType: "perRoom" | "perPerson" | "included";
      fee: number;
      currency: string;
    }[];
    regulations: {
      _id: string;
      title: string;
      description: string;
      type: "entry_exit" | "pet_policy" | "common_area" | "other";
      effectiveFrom: string;
    }
  };
}
