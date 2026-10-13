import { axiosBase } from "../config/axiosConfig";

// Request to backend endpoint which checks if user is connected to USOS.
// Rejects (non-2xx status) when the account is not connected.
export function checkIfConnectedToUsos() {
  return axiosBase
    .get(`/usos/check-connection`)
    .then((response) => response.data);
}
