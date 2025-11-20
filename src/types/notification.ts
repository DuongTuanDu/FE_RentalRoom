import type { is } from "date-fns/locale";

export interface INotification {
  _id: string;
  landlordId: string;
  createBy: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  createByRole: "landlord" | "staff";
  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";
  scope: "all" | "staff_buildings" | "building" | "floor" | "room" | "resident";
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  residentId?: string;
  buildingIds?: string[];
  readBy?: Array<{
    residentId: string;
    readAt: string;
  }>;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateNotificationRequest {
  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";
  scope: "all" | "staff_buildings" | "building" | "floor" | "room" | "resident";
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  residentId?: string;
  buildingIds?: string[];
}

export interface IGetMyNotificationsResponse {
  status: boolean;
  message: string;
  data: INotification[];
}

export interface IGetNotificationByIdResponse {
  status: boolean;
  message: string;
  data: INotification;
}

export interface ICreateNotificationResponse {
  status: boolean;
  message: string;
  data: INotification;
}

export interface IUpdateNotificationResponse {
  status: boolean;
  message: string;
  data: INotification;
}

export interface IDeleteNotificationResponse {
  status: boolean;
  message: string;
}

export interface IMarkAsReadResponse {
  status: boolean;
  message: string;
}