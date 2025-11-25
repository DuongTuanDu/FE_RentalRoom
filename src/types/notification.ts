export interface INotification {
  _id: string;
  landlordId: string;
  createBy: {
    _id: string;
    email: string;
    userInfo?: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  createByRole: "landlord" | "staff" | "resident";
  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";
  target: {
    buildings?: string[];
    floors?: string[];
    rooms?: string[];
    residents?: string[];
  };
  images?: string[];
  link?: string | null;
  readBy?: Array<{
    accountId: string;
    readAt: string;
  }>;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    readCount: number;
  };
  isRead?: boolean; 
}

export interface ICreateNotificationRequest {
  title: string;
  content: string;
  type?: "general" | "bill" | "maintenance" | "reminder" | "event";
  images?: string[];
  link?: string;
  target: {
    buildings?: string[];
    floors?: string[];
    rooms?: string[];
    residents?: string[];
  };
}

export interface IGetMyNotificationsResponse {
  status: boolean;
  message: string;
  data: INotification[];
}

export interface IGetNotificationByIdResponse {
  success: boolean;
  message: string;
  data: INotification;
}

export interface ICreateNotificationResponse {
  success: boolean;
  message: string;
  data: INotification;
}

export interface IUpdateNotificationResponse {
  success: boolean;
  message: string;
  data: INotification;
}

export interface IDeleteNotificationResponse {
  success: boolean;
  message: string;
}

export interface IMarkAsReadResponse {
  success: boolean;
  message: string;
}