export interface ITerm {
  _id: string;
  buildingId: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IGetTermsResponse {
  success: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: ITerm[];
}

export interface IGetTermDetailResponse {
  success: boolean;
  data: {
    _id: string;
    buildingId: {
      _id: string;
      name: string;
      address: string;
      landlordId: string;
    };
    name: string;
    description: string;
    status: "active" | "inactive";
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface ITermRequest {
  buildingId: string;
  name: string;
  description: string;
}

export interface ITermUpdateRequest {
  name: string;
  description: string;
  status: "active" | "inactive";
}
