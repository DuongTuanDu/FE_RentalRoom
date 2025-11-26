export interface UserAddress {
  _id?: string;
  address: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  provinceId?: string;
  districtId?: string;
  wardCode?: string;
}

export interface UserInfo {
  _id: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: "male" | "female" | "other" | "";
  address?: UserAddress[];
  bankInfo?:{
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrImageUrl: string;
  }
}

export interface User {
  _id: string;
  email: string;
  role: "resident" | "landlord" | "admin";
  isActivated: boolean;
  userInfo: UserInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUserInfoResponse {
  message: string;
  user: User;
}

export interface UpdateBankInfoRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl: string;
}

export interface UpdateBankInfoResponse {
  message: string;
  bankInfo: UpdateBankInfoRequest;
}
