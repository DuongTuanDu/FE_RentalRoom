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
  renewedFrom: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface startTrialSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: ISubscription;
    endate: string;
    durationDays: number;
  };
}

export interface IRenewSubscriptionResponse {
  success: boolean;
  data: {
    paymentUrl: string;
    subscriptionId: string;
    startDate: string;
    endDate: string;
  },
}

export interface ICurrentSubscriptionResponse {
  success: boolean;
    data: {
      hasActive: boolean;
      isTrial: boolean;
      action: string,
      daysLeft: number,
      package: {
        _id: string,
        name: string,
        price: number,
        durationDays: number,
        roomLimit: number,
        type: string,
        description: string
    }
  }
}

export interface IDetailSubscriptionResponse {
  success: boolean;
  data: {
    subscription: ISubscription;
    starts: {
      dayUsed: number;
      dayLeft: number;
      isActive: boolean;
      isExpired: boolean;
    };
  };
}

export interface ICancelSubscriptionResponse {
  cancelledSubscription: ISubscription;
  message: string;
}