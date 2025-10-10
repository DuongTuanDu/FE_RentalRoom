import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { authApi } from "../services/auth/auth.service";
import { buildingApi } from "../services/building/building.service";
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
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(authApi.middleware, buildingApi.middleware),
});

export const persistor = persistStore(store);
