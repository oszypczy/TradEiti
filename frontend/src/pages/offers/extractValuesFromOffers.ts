import { OfferDto } from "../../models/Offer";

// Each list starts with "" which stands for "no filter" in the select inputs.

export function extractSimpleValuesFromOffers(
  key: "course_id" | "course_name",
  offers: OfferDto[]
) {
  const values = [""];
  offers.forEach((offer) => values.push(offer.my_course[key]));
  return [...new Set(values)].sort();
}

export function extractLecturersFromOffers(offers: OfferDto[]) {
  const values: string[] = [""];
  offers.forEach((offer) => {
    offer.my_course.groups[0].lecturers.forEach((lecturer) => {
      values.push(lecturer);
    });
  });
  return [...new Set(values)].sort();
}

export function formatOfferDate(offer: OfferDto) {
  const group = offer.my_course.groups[0];
  return `${group.weekday}, ${group.start_time}-${group.end_time}`;
}

export function extractDatesFromOffers(offers: OfferDto[]) {
  const values: string[] = [""];
  offers.forEach((offer) => values.push(formatOfferDate(offer)));
  return [...new Set(values)].sort();
}
