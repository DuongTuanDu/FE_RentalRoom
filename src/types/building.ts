// interface mô tả một building đơn lẻ
export interface IBuilding {
  _id: string;
  name: string;
  address: string;
  landlordId: string;
  description?: string;
  eIndexType: "byNumber" | "byPerson" | "included";
  ePrice: number;
  wIndexType: "byNumber" | "byPerson" | "included";
  wPrice: number;
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

export interface CreateBuildingResponse {
  success: boolean;
  data: IBuilding;
}
