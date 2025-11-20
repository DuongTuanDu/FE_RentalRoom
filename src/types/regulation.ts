export interface IRegulation {
  _id: string;
  buildingId: string;
  title: string;
  description: string;
  status: "active" | "inactive";
  effectiveFrom: string;
  createdBy: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IRegulationRequest {
  buildingId: string;
  title: string;
  description: string;
  effectiveFrom: string;
}

export interface IRegulationRequestUpdate {
  title: string;
  description: string;
  status: "active" | "inactive";
  effectiveFrom: string;
}

export type IRegulationResponse = IRegulation[];
