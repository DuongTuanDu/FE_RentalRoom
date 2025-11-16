export type ContactStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface IContact {
  _id: string;
  tenantId: string | {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  landlordId: string | {
    _id: string;
    email: string;
    userInfo: {
      fullName: string;
      phoneNumber: string;
    };
  };
  buildingId: string | {
    _id: string;
    name: string;
    address: string;
  };
  roomId: string | {
    _id: string;
    roomNumber: string; 
  };
  postId: string | {
    _id: string;
    title: string;
  };
  contactName: string;
  contactPhone: string;
  tenantNote?: string;
  landlordNote?: string;
  contractId: {
    _id: string;
    landlordId: string;
    tenantId: string;
    buildingId: string;
    roomId: string;
    postId: string;
  };
  status: ContactStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetContactsRequest {
  page?: number;
  limit?: number;
  status?: ContactStatus;
  buildingId?: string;
}

export interface IGetContactsResponse {
    success: boolean;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: IContact[];
}

export interface IUpdateContactStatusRequest {
    action: string;
  landlordNote: string;
}

export interface IUpdateContactStatusResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    status: string;
    landlordNote?: string;
  }
}

export interface IContactStatistics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export interface ICreateContactRequest {
  postId: string;
  buildingId: string;
  roomId: string;
  contactName: string;
  contactPhone: string;
  tenantNote: string;
}

export interface ICreateContactResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    tenantId: string;
    landlordId: string;
    buildingId: string;
    roomId: string;
    postId: string;
    status: "pending";
    createdAt: string;
  };
}