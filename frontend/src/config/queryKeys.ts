import { OfferStatus } from "../models/enums/OfferStatus";

// Central list of react-query keys. Everything offer-related starts with
// "offers" so a single invalidation refreshes all offer views.
export const queryKeys = {
  offers: ["offers"] as const,
  userOffers: ["offers", "owned"] as const,
  receivedOffers: ["offers", "received"] as const,
  matchingOffers: (state: OfferStatus) => ["offers", "matching", state] as const,
  fittingOffers: (state: OfferStatus) => ["offers", "fitting", state] as const,
  presentOffers: (state: OfferStatus) => ["offers", "present", state] as const,
  courses: ["courses"] as const,
  courseGroups: (courseId: string) => ["courseGroups", courseId] as const,
  comments: (offerId: number) => ["comments", offerId] as const,
};
