import type IAuth from "@/types/auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface IAuthState {
  accessToken: string | null;
  emailVerify: string;
  isAuthenticated: boolean;
  userInfo: {
    _id: string;
    email: string;
    role: string;
    isActivated: string;
    userInfor: {
      _id: string;
      fullName: string;
      phoneNumber: string;
      dob: string;
      gender: string;
      address: {
        address: string;
        provinceName: string;
        districtName: string;
        wardName: string;
      }[];
    };
    createdAt: string;
    updatedAt: string;
  };
}

const initialState: IAuthState = {
  accessToken: null,
  emailVerify: "",
  isAuthenticated: false,
  userInfo: {
    _id: "",
    email: "",
    role: "",
    isActivated: "",
    userInfor: {
      _id: "",
      fullName: "",
      phoneNumber: "",
      dob: "",
      gender: "",
      address: [
        {
          address: "",
          provinceName: "",
          districtName: "",
          wardName: "",
        },
      ],
    },
    createdAt: "",
    updatedAt: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, { payload }: PayloadAction<IAuth>) => {
      state.accessToken = payload.accessToken;
      state.isAuthenticated = true;
      if (payload.accessToken) {
        Cookies.set("accessToken", payload.accessToken);
      }
    },
    setLogout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.userInfo = {
        _id: "",
        email: "",
        role: "",
        isActivated: "",
        userInfor: {
          _id: "",
          fullName: "",
          phoneNumber: "",
          dob: "",
          gender: "",
          address: [
            {
              address: "",
              provinceName: "",
              districtName: "",
              wardName: "",
            },
          ],
        },
        createdAt: "",
        updatedAt: "",
      };
      Cookies.remove("accessToken");
    },
    setEmailVerify(state, action) {
      state.emailVerify = action.payload;
    },
    setIsAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
  },
});

export const {
  setLogin,
  setLogout,
  setEmailVerify,
  setIsAuthenticated,
  setUserInfo,
} = authSlice.actions;

export default authSlice.reducer;
