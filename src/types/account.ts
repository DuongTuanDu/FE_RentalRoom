// types/account.ts

export interface IAccount {
  _id: string;
  email: string;
  role: "admin" | "landlord" | "resident";
  isActivated: boolean;
  createdAt: string;
  updatedAt: string;
  userInfo?: string;
}

export interface GetAccountsResponse {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  users: IAccount[];
}

export interface IAccountProfile {
  message: string;
  user: {
    _id: string;
    email: string;
    role: "admin" | "landlord" | "resident";
    isActivated: boolean;
    createdAt: string;
    updatedAt: string;
    userInfo: {
      fullName: string;
      phoneNumber: string;
      gender: string;
      dob: string;
      address: [
        {
          address: string;
          provinceName: string;
          districtName: string;
          wardName: string;
        }
      ];
      avatarUrl?: string;
    };
  }
}

export interface GetAccountsRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "landlord" | "resident" | "all";
}

export interface UpdateAccountStatusRequest {
  id: string;
}

export interface UpdateAccountStatusResponse {
  message: string;
  data: {
    id: string;
        email: string;
        isActivated: boolean;
    };
}

export interface UpdateAccountRoleRequest {
  id: string;
  role: "admin" | "landlord" | "tenant";
}

export interface UpdateAccountRoleResponse {
  message: string;
  data: {
    id: string;
    email: string;
    role: "admin" | "landlord" | "tenant";
  };
}

