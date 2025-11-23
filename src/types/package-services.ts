export interface IPackage {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
  roomLimit: number;
  type: string;
  isActive: boolean;
  description: string;
  createdBy: string;
  createdAt: string;
  __v: number;
}

export interface GetPackagesResponse {
  success: boolean;
  data: IPackage[];
}
