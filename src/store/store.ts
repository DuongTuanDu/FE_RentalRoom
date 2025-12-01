import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { authApi } from "../services/auth/auth.service";
import { buildingApi } from "../services/building/building.service";
import { roomApi } from "../services/room/room.service";
import { floorApi } from "../services/floor/floor.service";
import { packageServicesApi } from "../services/package-services/package-services.service";
import { profileApi } from "../services/profile/profile.service";
import { furnitureApi } from "../services/furniture/furniture.service";
import { buildingFurnitureApi } from "../services/building-furniture/building-furniture.service";
import { roomFurnitureApi } from "../services/room-furniture/room-furniture.service";
import { regulationApi } from "../services/regulation/regulation.service";
import { buildingServicesApi } from "../services/building-services/building-services.service";
import { postApi } from "../services/post/post.service";
import authReducer from "../services/auth/auth.slice";
import storage from "redux-persist/lib/storage";
import { packageSubscriptionApi } from "@/services/package-services/package-subscription.service";
import { accountApi } from "@/services/account/account.service";
import { termApi } from "@/services/term/term.service";
import { contractTemplateApi } from "@/services/contract-template/contract-template.service";
import { contactRequestApi } from "@/services/contact-request/contact-request.service";
import { maintenanceApi } from "@/services/maintenance/maintenance.service";
import { landlordScheduleApi } from "@/services/landlord-schedule/landlord-schedule.service";
import { roomAppointmentApi } from "@/services/room-appointment/room-appointment.service";
import { revenueApi } from "@/services/revenue/revenue.service";
import { contractApi } from "@/services/contract/contract.service";
import { staffApi } from "@/services/staff/staff.service";
import { notificationApi } from "@/services/notification/notification.service";
import { socketMiddleware } from "@/middleware/socket.middleware";
import { analysisApi } from "@/services/analysis/analysis.service";
import { invoiceApi } from "@/services/invoice/invoice.service";
import { utilityApi } from "@/services/utility/utility.service";
import { laundryApi } from "@/services/laundry/laundry.service";

// Cấu hình persist cho auth reducer
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "accessToken", "role", "userInfo"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [authApi.reducerPath]: authApi.reducer,
    [buildingApi.reducerPath]: buildingApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [floorApi.reducerPath]: floorApi.reducer,
    [packageServicesApi.reducerPath]: packageServicesApi.reducer,
    [packageSubscriptionApi.reducerPath]: packageSubscriptionApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [furnitureApi.reducerPath]: furnitureApi.reducer,
    [buildingFurnitureApi.reducerPath]: buildingFurnitureApi.reducer,
    [roomFurnitureApi.reducerPath]: roomFurnitureApi.reducer,
    [regulationApi.reducerPath]: regulationApi.reducer,
    [buildingServicesApi.reducerPath]: buildingServicesApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [termApi.reducerPath]: termApi.reducer,
    [contractTemplateApi.reducerPath]: contractTemplateApi.reducer,
    [contactRequestApi.reducerPath]: contactRequestApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [landlordScheduleApi.reducerPath]: landlordScheduleApi.reducer,
    [roomAppointmentApi.reducerPath]: roomAppointmentApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [utilityApi.reducerPath]: utilityApi.reducer,
    [laundryApi.reducerPath]: laundryApi.reducer
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      authApi.middleware,
      buildingApi.middleware,
      roomApi.middleware,
      floorApi.middleware,
      packageServicesApi.middleware,
      packageSubscriptionApi.middleware,
      profileApi.middleware,
      furnitureApi.middleware,
      buildingFurnitureApi.middleware,
      roomFurnitureApi.middleware,
      regulationApi.middleware,
      buildingServicesApi.middleware,
      postApi.middleware,
      accountApi.middleware,
      termApi.middleware,
      contractTemplateApi.middleware,
      contactRequestApi.middleware,
      maintenanceApi.middleware,
      landlordScheduleApi.middleware,
      roomAppointmentApi.middleware,
      revenueApi.middleware,
      contractApi.middleware,
      staffApi.middleware,
      notificationApi.middleware,
      socketMiddleware,
      analysisApi.middleware,
      invoiceApi.middleware,
      utilityApi.middleware,
      laundryApi.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;