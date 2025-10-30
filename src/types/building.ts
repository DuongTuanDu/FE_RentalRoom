// interface mô tả một building đơn lẻ
export interface IBuilding {
  _id: string;
  name: string;
  address: string;
  landlordId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
    };
  };
  description?: string;
  eIndexType: "byNumber" | "byPerson" | "included";
  ePrice: number;
  wIndexType: "byNumber" | "byPerson" | "included";
  wPrice: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// interface cho response chung của API getBuildings
export interface IBuildingResponse {
  data: IBuilding[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBuildingRequest {
  name: string;
  address: string;
  eIndexType: "byNumber" | "byPerson" | "included";
  ePrice: number;
  wIndexType: "byNumber" | "byPerson" | "included";
  wPrice: number;
  description?: string;
}

export interface CreateQuickBuildingRequest {
  name: string;
  address: string;
  floors: {
    count: number;
    startLevel: number;
    description?: string;
  };
  rooms: {
    perFloor: number;
    seqStart: number;
    defaults: {
      area: number;
      price: number;
      maxTenants: number;
      status: "available" | "rented" | "maintenance";
      description?: string;
      eStart: number;
      wStart: number;
    };
  };
  wIndexType: "byNumber" | "byPerson" | "included";
  wPrice: number;
  eIndexType: "byNumber" | "byPerson" | "included";
  ePrice: number;
  dryRun?: boolean;
}

export interface CreateBuildingResponse {
  success: boolean;
  data: IBuilding;
  message: string;
}

export interface IImportExcelRequest {
  file: File;
  parts?: "auto" | string; 
  onDupFloor?: "skip" | "error";
  onDupRoom?: "skip" | "error";
}

export interface IImportExcelResponse {
  message: string;
  results?: {
    buildingsCreated: number;
    floorsCreated: number;
    roomsCreated: number;
  }
}