// types/room.ts

import type { IContractInfo, IContractStatus, IPerson } from "./contract";

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
  contractRoommates: {
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
  success: boolean;
  message: string;
  data: {
    room: IMyRoom;
    furnitures: {
      _id: string;
      name: string;
      quantity: number;
      condition: string;
    }[];
    availableRooms: {
      _id: string;
      roomNumber: string;
      buildingName: string;
      status: "active" | "inactive";
      contract: {
        _id: string;
        contractNo: string;
        startDate: string;
        endDate: string;
        status: "active" | "upcoming";
      };
    }[];
  };
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

export interface IRoomContractResponse {
  contract: {
    _id: string;
    landlordId: string;
    tenantId: string;
    buildingId: {
      _id: string;
      name: string;
    };
    roomId: {
      _id: string;
      roomNumber: string;
    };
    contactId: string;
    eIndexType: "byNumber";
    ePrice: number;
    wIndexType: "byNumber" | "byPerson";
    wPrice: number;
    templateId: string;
    A: IPerson;
    B: IPerson;
    contract: IContractInfo;
    terms: {
      name: string;
      description: string;
      order: number;
    }[];
    regulations: {
      title: string;
      description: string;
      effectiveFrom: string;
      order: number;
    }[];
    status: IContractStatus;
    roommates: IPerson[];
    bikes: {
      bikeNumber: string;
      color: string;
      brand: string;
    }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    landlordSignatureUrl: string;
    sentToTenantAt: string;
    identityVerification?: {
      cccdFrontUrl: string;
      cccdBackUrl: string;
      selfieUrl: string;
      ocrData: {
        name: string;
        dob: string;
        cccd: string;
        permanentAddress: string;
      };
      faceMatchScore: number;
    };
    tenantSignatureUrl: string;
    moveInConfirmedAt?: string | null;
  };
}
