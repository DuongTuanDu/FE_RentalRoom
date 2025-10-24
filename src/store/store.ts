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
      postApi.middleware
    ),
});

export const persistor = persistStore(store);
