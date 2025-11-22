import type { IFurniture } from "./furniture";

export interface IMaintenanceItem {
  _id: string;
  buildingId: {
    id: string;
    name: string;
    address: string;
  };
  roomId: IRoom;
  furnitureId: IFurniture;
  reporterAccountId: IReporterAccount;
  title: string;
  description: string;
  photos: {
    url: string;
    note: string;
    _id: string;
  }[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "rejected";
  affectedQuantity: number;
  timeline: ITimeline[];
  scheduledAt: string;
  estimatedCost: number;
  actualCost: number;
  assigneeAccountId: {
    _id: string;
    email: string;
    password: string;
    userInfo: string;
    role: "landlord" | "admin" | "resident";
    isActivated: true;
    accessToken: string;
    refreshToken: string;
    createdAt: string;
    updatedAt: string;
    __v: 0;
    deviceId: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRoom {
  buildingId: string;
  floorId: string;
  roomNumber: string;
  images: string[];
  area: number;
  price: number;
  maxTenants: number;
  status: "available" | "rented" | "maintenance";
  eStart: number;
  wStart: number;
  description: string;
  isDeleted: boolean;
  deletedAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface IReporterAccount {
  _id: string;
  email: string;
  password: string;
  userInfo: string;
  role: "resident" | "landlord" | "admin";
  isActivated: boolean;
  accessToken: string;
  refreshToken: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ITimeline {
  by: {
    _id: string;
    email: string;
    password: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  action: string;
  note: string;
  _id: string;
  at: string;
}

export interface IMaintenanceRequest {
  status: "open" | "in_progress" | "resolved" | "rejected";
  //   assigneeAccountId: string;
  scheduledAt: string;
  estimatedCost: number;
  actualCost: number;
  note: string;
}

export interface ICommentMaintenanceRequest {
  note: string;
}

export interface IMaintenanceResponse {
  data: IMaintenanceItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IMaintenanceDetailResponse {
  data: IMaintenanceItem;
}

export interface IMaintenanceTenant {
  _id: string;
  buildingId: string;
  roomId: string;
  furnitureId: {
    _id: string;
    name: string;
  };
  reporterAccountId: string;
  assigneeAccountId: {
    _id: string;
    email: string;
    password: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
    role: "landlord" | "admin" | "resident";
  };
  title: string;
  photos: {
    url: string;
    note: string;
    _id: string;
  }[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "rejected";
  affectedQuantity: number;
  createdAt: string;
  updatedAt: string;
  assigneeName: string;
}

export interface IMaintenanceTenantItem {
  _id: string;
  buildingId: {
    id: string;
    name: string;
    address: string;
  };
  roomId: IRoom;
  furnitureId: IFurniture;
  reporterAccountId: IReporterAccount;
  title: string;
  description: string;
  photos: {
    url: string;
    note: string;
    _id: string;
  }[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "rejected";
  affectedQuantity: number;
  timeline: ITimeline[];
  assigneeAccountId: {
    _id: string;
    email: string;
    password: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
    role: "landlord" | "admin" | "resident";
    isActivated: true;
    accessToken: string;
    refreshToken: string;
    createdAt: string;
    updatedAt: string;
    __v: 0;
    deviceId: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IMaintenanceCreateRequest {
  roomId: string;
  furnitureId: string;
  title: string;
  description: string;
  photos?: {
    url: string;
    note?: string;
  }[];
  priority: "low" | "medium" | "high" | "urgent";
  affectedQuantity: number;
}

export interface IMaintenanceTenantResponse {
  data: IMaintenanceTenant[];
  total: number;
  page: number;
  limit: number;
}

export interface IMaintenanceTenantDetailsResponse {
  data: IMaintenanceTenantItem;
}
