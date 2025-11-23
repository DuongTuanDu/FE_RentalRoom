export interface IAnalyticsAdminResponse {
  success: boolean;
  data: {
    summary: {
      totalUsers: number;
      totalLandlords: number;
      newUsersThisPeriod: number;
      totalPackages: number;
      activePackages: number;
      trialPackages: number;
      totalRevenueThisPeriod: number;
      paidSubscriptionsThisPeriod: number;
    };
    charts: {
      dailyTrend: {
        date: string;
        count: number;
        revenue: number;
      }[];
      packagePie: {
        _id: string;
        count: number;
        revenue: number;
      }[];
    };
    currentStatus: {
      active: number;
      expired: number;
      upcoming: number;
      pending_payment: number;
      cancelled: number;
    };
    topLandlords: {
      _id: string;
      email: string;
      totalSpent: number;
      subscriptionCount: number;
    }[];
    dateRange: {
      start: string;
      end: string;
      filter: "today" | "week" | "month" | "year" | "custom" | string;
    };
  };
}
