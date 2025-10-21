export interface IFloor {
  _id: string;
  buildingId: string;
  level: number;
  description: string;
  isDeleted: boolean;
  deletedAt: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFloorRequest {
  buildingId: string;
  level: number;
  description?: string;
}

export interface UpdateFloorRequest extends CreateFloorRequest {
  id: string;
}

export type IFloorListResponse = {
  data: IFloor[];
  total: number;
  page: number;
  limit: number;
};
