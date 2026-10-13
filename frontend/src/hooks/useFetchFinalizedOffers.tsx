import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../providers/authContext";
import { getOffersAndOfferRequests } from "../apiFunctions/getOffersAndOfferRequests";
import { OfferStatus } from "../models/enums/OfferStatus";
import { OfferDto } from "../models/Offer";
import { queryKeys } from "../config/queryKeys";

// Presents every offer from the perspective of `username`: for offers where
// they are the receiver, "my course" and "wanted course" are swapped.
// Returns new objects; the input is not modified.
export function toUserPerspective(
  offers: OfferDto[],
  username: string | undefined
): OfferDto[] {
  return offers.map((offer) =>
    offer.owner_username === username
      ? offer
      : {
          ...offer,
          my_course: offer.wanted_course,
          wanted_course: offer.my_course,
        }
  );
}

// The other participant of an exchange.
export function partnerOf(offer: OfferDto, username: string | undefined): string {
  return offer.owner_username === username ? offer.receiver_username : offer.owner_username;
}

// Completed exchanges of the current user, from their perspective
// (my_course = the group they left, wanted_course = the group they got).
export function useFetchFinalizedOffers() {
  const { currentUser } = useAuthContext();
  const { data } = useQuery({
    queryKey: queryKeys.presentOffers(OfferStatus.COMPLETED),
    queryFn: () => getOffersAndOfferRequests(OfferStatus.COMPLETED),
  });

  const finalizedOffers = useMemo(
    () => data && toUserPerspective(data, currentUser?.username),
    [data, currentUser?.username]
  );

  return { finalizedOffers };
}
