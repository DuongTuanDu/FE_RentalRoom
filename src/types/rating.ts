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