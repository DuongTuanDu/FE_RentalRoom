// types/room.ts

import type { IPerson } from "./contract";

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

export interface IMyRoom {
  _id: string;
  building: {
    _id: string;
    name: string;
    address: string;
  };
  roomNumber: string;
  images: string[];
  area: number;
  price: number;
  currentContract: {
    _id: string;
    no: string;
    price: number;
    startDate: string;
    endDate: string;
    roommates: IPerson[];
  };
  tenants: {
    _id: string;
    username: string;
    fullName: string;
    phoneNumber: string;
  }[];
  contractRoommates:  {
    name: string;
    cccd: string;
    phone: string;
    dob: string;
  }[];
  eStart: number;
  wStart: number;
  currentCount: number;
  maxTenants: number;
  status: "available" | "rented" | "maintenance";
}

export interface IRoomListResponse {
  data: IRoom[];
  total: number;
  page: number;
  limit: number;
}

export interface IMyRoomResponse {
  room: IMyRoom;
  furnitures: {
    _id: string;
    name: string;
    quantity: number;
    condition: string;
  }[];
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
    };
  };
}
