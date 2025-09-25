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
  message: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  emailVerified: boolean;
}
