export default interface IAuth {
  accessToken: string;
  refreshToken: string;
  data: {
    id: string;
    email: string;
    username: string;
    status: number;
    role: number;
  };
  id: string;
  role: string;
  message: string;
  status: boolean;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
}
