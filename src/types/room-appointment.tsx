export type AppointmentStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface IRoomAppointment {
  _id: string;
  tenantId: string;
  landlordId: {
    _id: string;
    email: string;
    userInfo: {
      fullName: string;
      phoneNumber: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
    address: string;
  };
  postId: {
    _id: string;
    title: string;
    address: string
  };
  contactName: string;
  contactPhone: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  tenantNote?: string;
  landlordNote?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRoomAppointmentListResponse {
  success: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: IRoomAppointment[];
}

export interface IRoomAppointmentDetailResponse {
  success: boolean;
  data: IRoomAppointment;
}

export interface IGetRoomAppointmentsParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  buildingId?: string;
  date?: string;
}

export interface IUpdateAppointmentStatusPayload {
  action: "accept" | "reject";
  landlordNote?: string;
}

export interface IUpdateAppointmentStatusRequest {
  id: string;
  data: IUpdateAppointmentStatusPayload;
}

export interface IUpdateAppointmentStatusResponse {
  success: boolean;
  message: string;
  data: IRoomAppointment;
}


export interface ICreateAppointmentRequest {
  postId: string;
  buildingId: string;
  date: string; 
  timeSlot: string; 
  contactName: string;
  contactPhone: string;
  tenantNote?: string;
}

export interface ICreateAppointmentResponse {
  success: boolean;
  message: string;
  data: IRoomAppointment;
}

export interface ITimeSlot {
  startTime: string;
  endTime: string; 
}

export interface IAvailableDay {
  date: string; 
  slots: ITimeSlot[];
  note?: string; 
}

export interface IAvailableSlotsResponse {
  success: boolean;
  buildingId: string;
  landlordId: string;
  availableDays: IAvailableDay[];
}

export interface IGetAvailableSlotsParams {
  buildingId: string;
  startDate?: string;
  endDate?: string; 
}

export interface ICancelAppointmentResponse {
  success: boolean;
  message: string;
}