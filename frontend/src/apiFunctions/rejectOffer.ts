import { axiosBase } from "../config/axiosConfig";

export function rejectOffer(offer_id: number) {
  return axiosBase.patch(`/offers/reject/${offer_id}`);
}
