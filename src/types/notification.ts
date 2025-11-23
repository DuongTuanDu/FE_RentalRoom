// ==================== CORE INTERFACES ====================

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

  createByRole: "landlord" | "staff" | "resident"; // backend cho phép resident

  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";

  // Thay đổi lớn: không còn scope + buildingId/floorId/roomId/residentId riêng lẻ
  // Mà dùng target object chứa các mảng
  target: {
    buildings?: string[];    // ObjectId[]
    floors?: string[];
    rooms?: string[];
    residents?: string[];
  };

  images?: string[];
  link?: string | null;

  readBy?: Array<{
    accountId: string;
    readAt: string; // ISO string
  }>;

  isDeleted: boolean;
  deletedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ==================== REQUEST INTERFACES ====================

export interface ICreateNotificationRequest {
  title: string;
  content: string;
  type?: "general" | "bill" | "maintenance" | "reminder" | "event"; // có default
  images?: string[];
  link?: string;

  // Thay vì scope + các Id riêng lẻ, giờ dùng target như backend
  target: {
    buildings?: string[];    // gửi cho toàn bộ cư dân các tòa này
    floors?: string[];       // gửi cho cư dân các tầng này
    rooms?: string[];        // gửi cho cư dân các phòng này
    residents?: string[];    // gửi trực tiếp cho các tài khoản này
  };
}

// Nếu bạn vẫn muốn giữ logic scope cũ ở frontend để dễ dùng (UI), bạn có thể tạo thêm một interface trung gian:

// Optional: Interface thân thiện hơn cho form (nếu cần)
export interface INotificationFormData {
  title: string;
  content: string;
  type: "general" | "bill" | "maintenance" | "reminder" | "event";
  buildingIds?: string[];
  floorIds?: string[];
  roomIds?: string[];
  residentIds?: string[];
  images?: string[];
  link?: string;
}

// ==================== RESPONSE INTERFACES (giữ nguyên cấu trúc chung) ====================

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