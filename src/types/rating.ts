export interface RatingItem {
  _id: string;
  buildingId: string;
  rating: number;
  comment?: string;
  images?: string[];
  user: {
    _id: string;
    fullName: string;
    avatar?: string;    
  }
  createdAt: string;
  updatedAt?: string;
}

export interface RatingSummary {
    buildingId: string | null;
  totalRatings: number;
  averageRating: number;
}

export interface GetRatingsRequest {
    buildingId: string;
    page?: number;
    limit?: number;
}



export interface CreateRatingRequest {
  buildingId: string;
  rating: number;
  comment?: string;
  images?: File[];
}

export interface RatingDetailResponse {
  success: true;
  summary: RatingSummary;
  ratings: RatingItem[];
}


export interface GetRatingsResidentResponse {
  success: boolean;
  data:{
    buildingId: string | null;
    summary: RatingSummary;
    ratings:[
        {
            _id: string;
            rating: number;
            comment?: string;
            images?: string[];
            user: {
              _id: string;
              fullName: string;
              avatar?: string;    
            }
            createdAt: string;
            updatedAt?: string;
        }
    ]
  }
 
}
export interface LandlordRatingItem {
  _id: string;
  building: {
    _id: string;
    name: string;
  };
  rating: number;
  comment?: string; 
  images?: string[];
  user: {
    fullName: string;
    phoneNumber?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface LandlordRatingsSummary {
  totalRatings: number;
  averageRating: number;
}

export interface LandlordRatingsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetLandlordRatingsResponse {
  success: true;
  data: {
    filter: "all_managed_buildings" | string;
    buildingId: string | null;
    totalManagedBuildings: number;
    pagination: LandlordRatingsPagination;
    summary: LandlordRatingsSummary;
    ratings: LandlordRatingItem[];
  };
}