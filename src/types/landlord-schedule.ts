export const DayOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayOfWeek = typeof DayOfWeek[keyof typeof DayOfWeek];

export interface IDefaultSlot {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string; 
}

export interface IScheduleOverride { 
  date?: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface ILandlordSchedule {
  _id?: string;
  landlordId?: string;
  buildingId: string;
  defaultSlots: IDefaultSlot[];
  overrides: IScheduleOverride[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpsertScheduleRequest {
  buildingId: string;
  defaultSlots: IDefaultSlot[];
  overrides: IScheduleOverride[];
}

export interface IUpsertScheduleResponse {
  success: boolean;
  message: string;
  data?: ILandlordSchedule;
}

export interface IGetScheduleResponse {
  success: boolean;
  data: ILandlordSchedule;
}

export interface IDeleteScheduleResponse {
  success: boolean;
  message: string;
}