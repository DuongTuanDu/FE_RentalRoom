export interface IWasherItem {
  buildingId: string;
  floorId: string;
  floorLevel: number;
  floorDescription: string;
  deviceId: string;
  name: string;
  tuyaDeviceId: string;
  type: "washer" | "dryer";
  status: "running" | "idle" | "unknown";
  power: number;
}

export interface IWasherListResponse {
  buildingId: string;
  total: number;
  data: IWasherItem[];
}

export interface ILaundryDeviceRequest {
  name: string;
  type: "washer" | "dryer";
  tuyaDeviceId: string;
}
