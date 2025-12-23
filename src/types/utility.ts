export interface IMeterStatus {
  electricity: {
    hasReading: boolean;
    status: string | null;
  };
  water: {
    hasReading: boolean;
    status: string | null;
  };
}

export interface IUtilityReading {
  type: "electricity" | "water";
  currentIndex: number | null;
  unitPrice: number | null;
  readingDate: string | null;
}

export interface IUtilityRoomItem {
  _id: string;
  buildingId: {
    _id: string;
    name: string;
    address: string;
    isDeleted: boolean;
    status: "active" | "inactive";
  };
  floorId: {
    _id: string;
    level: number;
    isDeleted: boolean;
    status: "active" | "inactive";
  };
  roomNumber: string;
  images: string[];
  area: number;
  price: number;
  maxTenants: number;
  status: "rented" | "available" | "maintenance";
  eStart: number;
  wStart: number;
  description: string;
  isDeleted: boolean;
  deletedAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currentContractId: string;
  currentTenantIds: string[];
  meterStatus: IMeterStatus;
  readingTemplate: {
    roomId: string;
    periodMonth: number;
    periodYear: number;
    electricity: IUtilityReading;
    water: IUtilityReading;
  };
}

export interface IUtilityItem {
  _id: string;
  landlordId: string;
  buildingId: {
    _id: string;
    name: string;
    address: string;
    wIndexType: "byNumber" | "byPerson";
    wPrice: number;
    eIndexType: "byNumber";
    ePrice: number;
  };
  roomId: {
    _id: string;
    buildingId: string;
    roomNumber: string;
  };
  contractId: string;
  periodMonth: number;
  periodYear: number;
  readingDate: string;
  ePreviousIndex: number;
  eCurrentIndex: number;
  eConsumption: number;
  eUnitPrice: number;
  eAmount: number;
  wPreviousIndex: number;
  wCurrentIndex: number;
  wConsumption: number;
  wUnitPrice: number;
  wAmount: number;
  status: "draft" | "confirmed" | "billed";
  createdById: string;
  invoiceId: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  confirmedAt: string | null;
  confirmedById: string | null;
}

export interface IUtilityReadingRequest {
  roomId: string;
  periodMonth: number;
  periodYear: number;
  eCurrentIndex: number;
  wCurrentIndex: number;
}

export interface ICreateUtilityBulkRequest {
  readings: {
    roomId: string;
    periodMonth: number;
    periodYear: number;
    eCurrentIndex: number;
    wCurrentIndex: number;
  }[];
}

export interface IUpdateReadingRequest {
  ePreviousIndex?: number;
  eCurrentIndex: number;
  eUnitPrice: number;
  wPreviousIndex?: number;
  wCurrentIndex: number;
  wUnitPrice: number;
  note: string;
}

export interface IUtilityRoomListResponse {
  message: string;
  data: IUtilityRoomItem[];
  total: number;
  page: number;
  limit: number;
  periodMonth: number;
  periodYear: number;
}

export interface IUtilityListResponse {
  items: IUtilityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUtilityDetailResponse {
  data: IUtilityItem;
}
