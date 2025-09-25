import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/auth/auth.service";
import authReducer from "../services/auth/auth.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware),
});
