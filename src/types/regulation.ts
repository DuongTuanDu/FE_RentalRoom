export interface IRegulation {
  _id: string;
  buildingId: string;
  title: string;
  description: string;
  type: "entry_exit" | "pet_policy" | "common_area" | "other";
  status: "active" | "inactive";
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRegulationRequest {
  buildingId: string;
  title: string;
  description: string;
  type: "entry_exit" | "pet_policy" | "common_area" | "other";
  effectiveFrom: string;
}

export interface IRegulationRequestUpdate {
  title: string;
  description: string;
  type: "entry_exit" | "pet_policy" | "common_area" | "other";
  status: "active" | "inactive";
  effectiveFrom: string;
}


export type IRegulationResponse = IRegulation[];
