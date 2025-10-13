import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { authApi } from "../services/auth/auth.service";
import { buildingApi } from "../services/building/building.service";
import { roomApi } from "../services/room/room.service";
import { floorApi } from "../services/floor/floor.service";
import { packageServicesApi } from "../services/package-services/package-services.service";
import authReducer from "../services/auth/auth.slice";
import storage from "redux-persist/lib/storage";

// Cấu hình persist cho auth reducer
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "accessToken", "userInfo"],
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
      packageServicesApi.middleware
    ),
});

export const persistor = persistStore(store);
