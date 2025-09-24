export default interface IAuth {
  token: {
    accessToken: string
    refreshToken: string
  }
  data: {
    id: string
    email: string
    username: string
    status: number
    role: number
  }
}

export interface IRegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  emailVerified: boolean
}