import { axiosBase } from "../config/axiosConfig";
import { OfferDto } from "../models/Offer";

// Offers the current user has sent an exchange request for
// (the user is the offer's receiver).
export function getOfferRequests() {
  return axiosBase.get<OfferDto[]>(`/offers/received`).then((response) => {
    return response.data;
  });
}
