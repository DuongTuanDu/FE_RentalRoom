export interface IContract {
  _id: string;
  tenantId: {
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
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contract: IContractInfo;
  status: IContractStatus;
  moveInConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IContractRenewal {
  _id: string;
  tenantId: {
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
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contract: {
    endDate: string;
  };
  renewalRequest: {
    months: number;
    requestedEndDate: string;
    note: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    requestedAt: string;
    requestedById: string;
    requestedByRole: "resident";
  };
}

export interface ITenantContract {
  _id: string;
  buildingId: {
    _id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contract: IContractInfo;
  status: IContractStatus;
  createdAt: string;
  updatedAt: string;
}

export type IPerson = {
  name: string;
  dob: string;
  cccd: string;
  cccdIssuedDate: string;
  cccdIssuedPlace: string;
  permanentAddress: string;
  phone: string;
  email: string;
};

export type IContractStatus =
  | "draft"
  | "sent_to_tenant"
  | "signed_by_tenant"
  | "signed_by_landlord"
  | "completed";

export interface IContractInfo {
  no: string;
  signPlace: string;
  signDate: string;
  price: number;
  deposit: number;
  startDate: string;
  endDate: string;
}

export interface IUpdateContractRequest {
  A: IPerson;
  contract: IContractInfo;
  terms: {
    name: string;
    description: string;
    order: number;
  }[];
  regulations: {
    title: string;
    description: string;
    effectiveFrom: string;
    order: number;
  }[];
}

export interface IContractRenewalResponse {
  items: IContractRenewal[];
  total: number;
  page: number;
  limit: number;
}

export interface IContractResponse {
  items: IContract[];
  total: number;
  page: number;
  limit: number;
}

export interface IContractDetailResponse {
  _id: string;
  landlordId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  tenantId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
      address: {
        address: string;
        provinceName: string;
        districtName: string;
        wardName: string;
        _id: string;
      }[];
      dob: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    price: number;
    maxTenants: number;
  };
  contactId: string;
  A: IPerson;
  B: IPerson;
  contract: IContractInfo;
  terms: {
    name: string;
    description: string;
    order: number;
  }[];
  regulations: {
    title: string;
    description: string;
    effectiveFrom: string;
    order: number;
  }[];
  status: IContractStatus;
  roommates: IPerson[];
  bikes: {
    bikeNumber: string;
    color: string;
    brand: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  landlordSignatureUrl: string;
  sentToTenantAt: string;
  tenantSignatureUrl: string;
  furnitures: {
    id: string;
    name: string;
    quantity: number;
    condition: "good" | "damaged" | "under_repair";
    damageCount: number;
  }[];
}

export interface IContractData {
  _id: string;
  landlordId: string;
  tenantId: string;
  buildingId: string;
  roomId: string;
  contactId: string;
  A: IPerson;
  B: IPerson;
  contract: {
    price: number;
    paymentCycleMonths: number;
  };
  terms: {
    name: string;
    description: string;
    order: number;
  }[];
  regulations: {
    title: string;
    description: string;
    effectiveFrom: string;
    order: number;
  }[];
  status: IContractStatus;
  roommates: IPerson[];
  bikes: {
    bikeNumber: string;
    color: string;
    brand: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  sentToTenantAt: string;
  furnitures: {
    name: string;
    category: string;
    code: string;
  }[];
}

export interface IContractCreateResponse {
  alreadyCreated: boolean;
  contract: IContractData;
}

export interface IUpdateTenantContractRequest {
  B: IPerson;
  bikes: {
    bikeNumber: string;
    color: string;
    brand: string;
  }[];
  roommates: IPerson[];
}

export interface IRequestExtendRequest {
  months: number;
  note: string;
}

export interface ITenantContractResponse {
  items: ITenantContract[];
  total: number;
  page: number;
  limit: number;
}

export interface ITenantContractDetailResponse {
  _id: string;
  landlordId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  tenantId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
      address: {
        address: string;
        provinceName: string;
        districtName: string;
        wardName: string;
        _id: string;
      }[];
      dob: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    price: number;
    maxTenants: number;
  };
  contactId: string;
  A: IPerson;
  B: IPerson;
  contract: IContractInfo;
  terms: {
    name: string;
    description: string;
    order: number;
  }[];
  regulations: {
    title: string;
    description: string;
    effectiveFrom: string;
    order: number;
  }[];
  status: IContractStatus;
  roommates: IPerson[];
  bikes: {
    bikeNumber: string;
    color: string;
    brand: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  landlordSignatureUrl: string;
  sentToTenantAt: string;
  completedAt: string;
  tenantSignatureUrl: string;
  renewalRequest: {
    months: number;
    requestedEndDate: string;
    note: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    requestedAt: string;
    requestedById: string;
    requestedByRole: "resident";
  }
  furnitures: {
    id: string;
    name: string;
    quantity: number;
    condition: "good" | "damaged" | "under_repair";
    damageCount: number;
  }[];
}

export interface ITerminateContractRequest {
  reason: string;
  terminatedAt: string;
}