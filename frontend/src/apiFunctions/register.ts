import { axiosBase } from "../config/axiosConfig";
import { UserCredentials } from "../models/UserCredentials";

export async function register(userCredentials: UserCredentials) {
  const response = await axiosBase.post<{ token: string }>(
    "/auth/register",
    userCredentials
  );
  return response.data;
}
