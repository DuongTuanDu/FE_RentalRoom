export interface IRevenue {
  _id: string;
  createBy: {
    _id: string;
    email: string;
    userInfo: string;
  };
  landlordId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  type: "revenue" | "expenditure";
  amount: number;
  recordedAt: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRevenueRequest {
  buildingId?: string;
  title: string;
  description: string;
  type: "revenue" | "expenditure";
  amount: number;
  recordedAt: string;
}

export interface IRevenueResponse {
  data: IRevenue[];
  total: number;
  page: number;
  limit: number;
}

export interface IRevenueStatisticsResponse {
  revenue: number;
  expenditure: number;
  profit: number;
}
