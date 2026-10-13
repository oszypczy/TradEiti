import { axiosBase } from "../config/axiosConfig";
import { OfferDto } from "../models/Offer";
import { OfferStatus } from "../models/enums/OfferStatus";

export async function getOffers(state: OfferStatus) {
  return axiosBase.get<OfferDto[]>(`/offers/user/${state}`).then((response) => {
    return response.data;
  });
}

export async function getFittingOffers(state: OfferStatus) {
  return axiosBase
    .get<OfferDto[]>(`/offers/user/${state}`, {
      params: { filter_groups: true },
    })
    .then((response) => {
      return response.data;
    });
}
