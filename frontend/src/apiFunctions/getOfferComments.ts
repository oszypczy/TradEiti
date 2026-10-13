import { axiosBase } from "../config/axiosConfig";
import { Comment } from "../models/Comment";

export function getOfferComments(offerId: number) {
  return axiosBase.get<Comment[]>(`/comments/${offerId}`).then((response) => {
    return response.data;
  });
}
