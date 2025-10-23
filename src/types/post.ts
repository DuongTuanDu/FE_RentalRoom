export interface IPost {
  _id: string;
  landlordId: string;
  buildingId: string;
  title: string;
  description: string;
  address: string;
  price: number;
  area: number;
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
  price: number;
  area: number;
  address: string;
}

export interface ICreatePostRequest {
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  buildingId: string;
  isDraft: boolean;
  images?: File[];
}

export interface IGetPostsResponse {
  success: boolean;
  data: IPost[];
}

export interface IGenerateAIDescriptionResponse {
  success: boolean;
  data: {
    aiDescription: string;
  };
}
