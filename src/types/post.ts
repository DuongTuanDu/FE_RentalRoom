export interface IPost {
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
  buildingId: {
    name: string;
    address: string;
    _id: string;
  };
  roomIds: string[];
  title: string;
  description: string;
  address: string;
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  images: string[];
  isDraft: boolean;
  isDeleted: boolean;
  status: "active" | "hidden" | "expired";
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

export interface IGenerateAIDescriptionRequest {
  title: string;
  address: string;
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  buildingInfo: {
    eIndexType: "byNumber" | "byPerson" | "included";
    ePrice: number;
    wIndexType: "byNumber" | "byPerson" | "included";
    wPrice: number;
    services: {
      label: string;
      fee: number;
    }[];
    regulations: {
      title: string;
      description: string;
    }[];
  };
}

export interface ICreatePostRequest {
  title: string;
  description: string;
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  address: string;
  buildingId: string;
  roomIds: string[];
  isDraft: boolean;
  images?: File[];
}

export interface IGetPostsResponse {
  success: boolean;
  data: IPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IGetPostDetailResponse {
  success: boolean;
  data: {
    post: IPost;
    building: {
      _id: string;
      name: string;
      address: string;
      eIndexType: "byNumber" | "byPerson" | "included";
      ePrice: number;
      wIndexType: "byNumber" | "byPerson" | "included";
      wPrice: number;
      status: "active" | "inactive";
    };
    rooms: {
      _id: string;
      floorId: string;
      roomNumber: string;
      images: string[];
      area: number;
      price: number;
      status: "available" | "rented" | "maintenance";
    }[];
    services: {
      _id: string;
      name: string;
      label: string;
      description: string;
      chargeType: "perRoom" | "perPerson" | "included";
      fee: number;
      currency: string;
    }[];
    regulations: {
      _id: string;
      title: string;
      description: string;
      type: "entry_exit" | "pet_policy" | "common_area" | "other";
      effectiveFrom: string;
    };
  };
}

export interface IGetPostResidentDetailResponse {
  success: boolean;
  data: {
    _id: string;
    landlordId: {
      _id: string;
      email: string;
      fullName: string;
      phoneNumber: string;
    };
    roomIds: string[];
    title: string;
    description: string;
    address: string;
    priceMin: number;
    priceMax: number;
    areaMin: number;
    areaMax: number;
    images: string[];
    isDraft: boolean;
    isDeleted: boolean;
    status: "active" | "hidden" | "expired";
    createdAt: string;
    updatedAt: string;
    slug: string;
    __v: number;
    buildingId: {
      _id: string;
      name: string;
      address: string;
      eIndexType: "byNumber" | "byPerson" | "included";
      ePrice: number;
      wIndexType: "byNumber" | "byPerson" | "included";
      wPrice: number;
    };
    rooms: {
      _id: string;
      floorId: string;
      roomNumber: string;
      images: string[];
      area: number;
      price: number;
      status: "available" | "rented" | "maintenance";
    }[];
  };
}

export interface IGenerateAIDescriptionResponse {
  success: boolean;
  data: {
    aiDescription: string;
  };
}
