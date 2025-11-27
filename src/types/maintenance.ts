import type { IFurniture } from "./furniture";

export interface IMaintenanceDetailItem {
  _id: string;
  buildingId: {
    id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    currentTenantIds: string[]
  };
  furnitureId: IFurniture;
  category: ICategory;
  reporterAccountId: IReporterAccount;
  title: string;
  description: string;
  photos: {
    url: string;
    _id: string;
  }[];
  status: "open" | "in_progress" | "resolved" | "rejected";
  affectedQuantity: number;
  timeline: ITimeline[];
  repairCost: number;
  image: string[] // ảnh landlord gửi
  createdAt: string;
}

export interface IMaintenanceItem {
  _id: string;
  title: string;
  category: ICategory;
  status: "open" | "in_progress" | "resolved" | "rejected";
  assignee: {
    name: string;
    phone: number;
  };
  roomNumber: string;
  reportedBy: string;
  photoCount: number;
  proofImageCount: number;
  repairCost: number;
  mustPay: boolean;
  affectedQuantity: number;
  createdAt: string;
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
  repairCost: number;
  note: string;
  images: File[];
}

export interface ICommentMaintenanceRequest {
  note: string;
}

export interface IMaintenanceResponse {
  success: boolean;
  data: IMaintenanceItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
  };
}

export interface IMaintenanceDetailResponse {
  data: IMaintenanceDetailItem;
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
  category: ICategory;
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

export const CATEGORY = [
  "furniture", // đồ nội thất
  "electrical", // điện, ổ cắm, đèn
  "plumbing", // nước, vòi, bồn rửa, toilet
  "air_conditioning", // điều hòa
  "door_lock", // khóa cửa, chìa khóa
  "wall_ceiling", // tường, trần nhà, sơn, nứt
  "flooring", // sàn gỗ, gạch
  "windows", // cửa sổ, kính
  "appliances", // tủ lạnh, máy giặt, lò vi sóng...
  "internet_wifi", // mạng internet
  "pest_control", // diệt côn trùng
  "cleaning", // vệ sinh
  "safety", // bình chữa cháy, báo khói
  "other", // khác
] as const;

export type ICategory = (typeof CATEGORY)[number];

export interface IMaintenanceCreateRequest {
  roomId: string;
  category: ICategory;
  furnitureId?: string; // Chỉ bắt buộc khi category = "furniture"
  title: string;
  description: string;
  affectedQuantity: number;
  images?: File;
}

export interface IMaintenanceRequestItem {
  _id: string;
  title: string;
  category: ICategory;
  status: "open" | "in_progress" | "resolved" | "rejected";
  itemName: string | null;
  roomNumber: string;
  reportedBy: {
    name: string;
    isMe: boolean;
  };
  assignee: string | null;
  photoCount: number;
  hasPhoto: boolean;
  affectedQuantity: number;
  scheduledAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IMaintenanceTenantResponse {
  success: boolean;
  summary: {
    totalRequests: number;
    activeRooms: number;
  };
  rooms: {
    id: string;
    roomNumber: string;
  }[];
  requests: IMaintenanceRequestItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IMaintenanceTenantDetailsResponse {
  data: IMaintenanceTenantItem;
}
