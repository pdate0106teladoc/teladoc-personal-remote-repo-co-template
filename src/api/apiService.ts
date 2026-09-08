import type { AxiosResponse, AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";

const withNoTimeout = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  return { timeout: 0, ...(config || {}) }; // No timeout unless overridden
};

const api = {
  get: async <T = unknown>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.get(url, {
      params,
      ...withNoTimeout(config),
    });
    return response.data;
  },

  post: async <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(
      url,
      data,
      withNoTimeout(config),
    );
    return response.data;
  },

  put: async <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.put(
      url,
      data,
      withNoTimeout(config),
    );
    return response.data;
  },

  patch: async <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.patch(
      url,
      data,
      withNoTimeout(config),
    );
    return response.data;
  },

  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.delete(
      url,
      withNoTimeout(config),
    );
    return response.data;
  },

  postWithResponse: async <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return await axiosInstance.post(url, data, withNoTimeout(config));
  },
  
  putWithResponse: async <T = unknown>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return await axiosInstance.put(url, data, withNoTimeout(config));
  },
};

export default api;
