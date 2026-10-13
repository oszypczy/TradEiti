import { OfferDto } from "../models/Offer";
import { OfferStatus } from "../models/enums/OfferStatus";

// True when the user has no open (not yet completed) offer for the given
// course class type, i.e. a new offer for it may be created.
export function hasNoActiveOfferFor(
  offers: OfferDto[] | undefined,
  courseId: string,
  classType: string
): boolean {
  if (!offers) return true;
  return !offers.some(
    (offer) =>
      offer.state !== OfferStatus.COMPLETED &&
      offer.my_course.course_id === courseId &&
      offer.my_course.groups[0]?.class_type_name === classType
  );
}
