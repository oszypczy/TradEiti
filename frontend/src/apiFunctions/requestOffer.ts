import { axiosBase } from "../config/axiosConfig";

export function requestOffer(offer_id: number) {
  return axiosBase.patch(`/offers/send-request/${offer_id}`);
}
