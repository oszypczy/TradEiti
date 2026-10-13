import { axiosBase } from "../config/axiosConfig";

// Request to backend endpoint which changes username; returns a new JWT
export async function changeUserLogin(username: string) {
  const response = await axiosBase.post<{ token: string }>(
    "/user/change-username",
    { username }
  );
  return response.data;
}

// Request to backend endpoint which changes avatar
export async function changeUserAvatar(avatar: string) {
  const response = await axiosBase.post("/user/change-avatar", { avatar });
  return response.data;
}
