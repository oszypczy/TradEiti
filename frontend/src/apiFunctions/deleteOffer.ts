import { axiosBase } from "../config/axiosConfig";

export function removeOffer(offer_id: number) {
  return axiosBase.delete(`/offers/delete/${offer_id}`);
}
