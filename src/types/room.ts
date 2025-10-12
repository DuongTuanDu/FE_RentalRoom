export interface IRoom {
  _id: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  area: number;
  price: number;
  maxTenants: number;
  status: "available" | "occupied" | "maintenance";
  description: string;
  createdAt: string;
}

export interface IRoomListResponse {
  data: IRoom[];
  total: number;
  page: number;
  limit: number;
}
