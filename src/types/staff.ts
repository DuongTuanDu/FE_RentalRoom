export interface IStaff{
    _id: string;
    accountId: {
        _id: string;
        email: string;
        userInfo: {
            _id: string;
            fullName: string;
            phoneNumber: string,
            dob: string,
            gender: string,
            address: string
        }
      isActivated: boolean;
    };
    assignedBuildings:[
        {
            id: string;
            name: string;
            address: string
        }
    ];
    permissions: string[];
    createdAt: string;
}

export interface IPermission {
  _id: string;
  code: string;
  name: string;
  group: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStaffRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  address: string;
  assignedBuildings: string[];
  permissions: string[];
}

export interface ICreateStaffResponse {
  message: string,
  staff: IStaff
}

export interface IFirstTimeChangePasswordRequest {
  token: string; 
  newPassword: string;
  confirmPassword: string;
}

export interface IFirstTimeChangePasswordResponse {
  message: string;
}

export interface IResendTemporaryPasswordRequest {
  staffId: string;
}

export interface IResendTemporaryPasswordResponse {
  message: string;
}

export interface IUpdateInactiveStaffRequest {
  isActive: boolean;
}

export interface IUpdateInactiveStaffResponse {
  message: string;
  staffId: string;
  inActive: boolean;
}

export interface IUpdateStaffInfoRequest {
  fullName: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  address: string;
}

export interface IUpdateStaffPermissionRequest {
  assignedBuildings: string[];
  permissions: string[];
}

export interface IUpdateStaffPermissionResponse {
  message: string;
  staffId: string;
}