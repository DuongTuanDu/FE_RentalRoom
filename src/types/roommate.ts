export interface IRoommateRequest {
  roomId: string;
  userIds: string[];
}

export interface IRoommate {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: "male" | "female" | "other";
  address: string;
  avatar: string;
  isMainTenant: boolean;
  isMe: boolean;
}

export interface IRoommateResponse {
  success: boolean;
  data: {
    roomNumber: string;
    maxTenants: number;
    currentCount: number;
    canAddMore: boolean;
    isMainTenant: boolean;
    roommates: IRoommate[];
  };
}

export interface IRoommateDetail  {
  success: boolean;
  data: {
    _id: string;
    email: string;
    isMainTenant: boolean;
    userInfo: {
      _id: string;
      fullName: string;
      dob: string;
      gender: "male" | "female" | "other";
      phoneNumber: string;
    };
  };
};

export interface ISearchRoommateResponse {
  success: boolean;
  data: {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
  }[];
}
