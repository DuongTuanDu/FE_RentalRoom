export interface IPackage {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
  roomLimit: number;
  description: string;
  createdBy: string;
  createdAt: string;
  __v: number;
}
export interface ISubscription {
  _id: string;
  landlordId: string;
  packageId: IPackage;
  startDate: string;
  endDate: string;
  status: string;   
  amount: number;
  isTrial: boolean;
  isRenewal: boolean;
  paymentMethod: string;
  paymentId: string;
}

export interface ISubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    data: ISubscription[];
  };
}

export interface ICreateSubscriptionRequest {
  packageId: string;
}

export interface ICreateSubscriptionResponse {
  success: boolean;
  data: {
    paymentUrl: string;
  }; 
}
