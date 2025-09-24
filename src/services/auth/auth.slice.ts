import type IAuth from '@/types/auth'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'


interface IAuthState {
  accessToken: string | null
  emailVerify: string
  isAuthenticated: boolean
  userInfo: {
    id: number
    name: string
    username: string
    email: string
    phone: string
    avatarPublicId: string
    avatarUrl: string
    role: number
    status: number
    createdAt: string
  }
}

const initialState: IAuthState = {
  accessToken: null,
  emailVerify: '',
  isAuthenticated: false,
  userInfo: {
    id: 0,
    name: '',
    username: '',
    email: '',
    phone: '',
    avatarPublicId: '',
    avatarUrl: '',
    role: 0,
    status: 0,
    createdAt: ''
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, { payload }: PayloadAction<IAuth>) => {
      state.accessToken = payload.token.accessToken

      if (payload.token.accessToken) {
        Cookies.set('accessToken', payload.token.accessToken)
      }
    },
    setLogout: (state) => {
      state.accessToken = null
      state.isAuthenticated = false
      state.userInfo = {
        id: 0,
        name: '',
        username: '',
        email: '',
        phone: '',
        avatarPublicId: '',
        avatarUrl: '',
        role: 0,
        status: 0,
        createdAt: ''
      }
      Cookies.remove('accessToken')
    }
  }
})

export const {
  setLogin,
  setLogout,
} = authSlice.actions

export default authSlice
