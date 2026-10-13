import axios from "axios";
import { getToken } from "../auth/JwtToken";

export const apiBaseUrl: string = import.meta.env.VITE_API_URL ?? "/api";

export const axiosBase = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Read the token on every request so a fresh login/logout takes effect
// without reloading the page.
axiosBase.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});
