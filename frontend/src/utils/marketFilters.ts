import { OfferDto } from "../models/Offer";
import { DayCode, toGroupView } from "./groupView";

export interface MarketFilters {
  query: string;
  courseId: string;
  day: DayCode | "";
  sort: "new" | "old";
}

export const EMPTY_FILTERS: MarketFilters = { query: "", courseId: "", day: "", sort: "new" };

export function hasActiveFilters(filters: MarketFilters): boolean {
  return Boolean(filters.query.trim() || filters.courseId || filters.day);
}

// Free-text search over course, lecturers and owner; course and day (of the offered group) filters; id-based sort.
export function filterMarket(offers: OfferDto[], filters: MarketFilters): OfferDto[] {
  const query = filters.query.trim().toLowerCase();
  const result = offers.filter((offer) => {
    const give = offer.my_course.groups[0];
    const want = offer.wanted_course.groups[0];
    if (filters.courseId && offer.my_course.course_id !== filters.courseId) return false;
    if (filters.day && toGroupView(give).day !== filters.day) return false;
    if (!query) return true;
    const haystack = [
      offer.my_course.course_name,
      offer.my_course.course_id,
      offer.owner_username,
      ...(give?.lecturers ?? []),
      ...(want?.lecturers ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
  const direction = filters.sort === "new" ? -1 : 1;
  return [...result].sort((a, b) => direction * (a.offer_id - b.offer_id));
}

export function courseOptions(offers: OfferDto[]): { value: string; label: string }[] {
  const byId = new Map<string, string>();
  offers.forEach((offer) => byId.set(offer.my_course.course_id, offer.my_course.course_name));
  return [...byId.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pl"));
}
