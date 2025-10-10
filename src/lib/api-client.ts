import axios, { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URl;
const TIMEOUT = 15000;

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

let axiosInstance = createAxiosInstance();

type BaseQueryArgs = {
  url: string;
  method?: Method;
  data?: unknown;
  params?: Record<string, any>;
  config?: AxiosRequestConfig;
};

type BaseQueryResult<T = any> =
  | { data: T }
  | { error: { status: number | string; message: any } };

export const baseQuery = async <T = any>({
  url,
  method = "GET",
  data,
  params,
  config = {},
}: BaseQueryArgs): Promise<BaseQueryResult<T>> => {
  try {
    const response = await axiosInstance({
      url,
      method,
      data,
      params,
      ...config,
    });

    return { data: response.data as T };
  } catch (error) {
    const err = error as AxiosError;
    return {
      error: {
        status: err.response ? err.response.status! : "FETCH_ERROR",
        message: err.response ? err.response.data : err.message,
      },
    };
  }
};

export const refreshAxiosInstance = () => {
  axiosInstance = createAxiosInstance();
};

export default axiosInstance;