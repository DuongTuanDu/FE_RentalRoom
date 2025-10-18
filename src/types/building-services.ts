export interface IBuildingService {
  _id: string;
  buildingId: string;
  landlordId: string;
  name: "internet" | "parking" | "cleaning" | "security" | "other";
  label?: string;
  description?: string;
  chargeType: "perRoom" | "perPerson" | "included" | "fixed";
  fee: number;
  currency: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IBuildingServiceRequest {
  name: "internet" | "parking" | "cleaning" | "security" | "other";
  label?: string;
  description?: string;
  chargeType: "perRoom" | "perPerson" | "included" | "fixed";
  fee: number;
  currency: string;
}

export interface IUpdateBuildingServiceRequest {
  label?: string;
  description?: string;
  chargeType?: "perRoom" | "perPerson" | "included" | "fixed";
  fee?: number;
  currency?: string;
}

export type IBuildingServicesResponse = IBuildingService[];
