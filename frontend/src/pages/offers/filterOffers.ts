import { OfferDto } from "../../models/Offer";
import { SearchOfferOptions } from "../../models/SearchOfferOptions";
import { formatOfferDate } from "./extractValuesFromOffers";

export function filterOffers(
  searchValues: Partial<SearchOfferOptions>,
  offers: OfferDto[]
) {
  return offers.filter(
    (offer) =>
      (!searchValues.course_id ||
        offer.my_course.course_id === searchValues.course_id) &&
      (!searchValues.course_name ||
        offer.my_course.course_name === searchValues.course_name) &&
      (!searchValues.lecturer ||
        offer.my_course.groups[0].lecturers.includes(searchValues.lecturer)) &&
      (!searchValues.date || formatOfferDate(offer) === searchValues.date)
  );
}
