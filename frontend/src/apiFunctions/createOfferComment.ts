import { axiosBase } from "../config/axiosConfig";
import { NewComment } from "../models/Comment";

export function createOfferComment(comment: NewComment) {
  return axiosBase.post("/comments/create", comment);
}
