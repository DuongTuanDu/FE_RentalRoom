export interface IFloor {
  id: string;
  buildingId: string;
  label: string;
  level: number;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFloorRequest {
  buildingId: string;
  label: string;
  level: number;
  description?: string;
}

export interface UpdateFloorRequest extends CreateFloorRequest {
  id: string;
}

export type IFloorListResponse = IFloor[];
