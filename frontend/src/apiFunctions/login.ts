import { axiosBase } from "../config/axiosConfig";
import { UserCredentials } from "../models/UserCredentials";

export async function login(userCredentials: UserCredentials) {
  const response = await axiosBase.post<{ token: string }>(
    "/auth/login",
    userCredentials
  );
  return response.data;
}
