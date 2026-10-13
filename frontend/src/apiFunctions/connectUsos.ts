import { axiosBase } from "../config/axiosConfig";

// Request to backend endpoint which returns the USOS authorization URL
export function connectUsos() {
  return axiosBase
    .get<string>(`/usos/connect`)
    .then((response) => response.data);
}
