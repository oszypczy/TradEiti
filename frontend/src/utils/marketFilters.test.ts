import { courseOptions, EMPTY_FILTERS, filterMarket, hasActiveFilters } from "./marketFilters";
import { course, group, offer } from "../test/fixtures";

const offers = [
  offer({ offer_id: 1, owner_username: "kuba", my: { weekday: "Poniedziałek", lecturers: ["Anna Kowalska"] } }),
  offer({
    offer_id: 3,
    owner_username: "ola",
    my_course: course({ course_id: "AISDI", course_name: "Algorytmy", groups: [group({ weekday: "Środa" })] }),
  }),
  offer({ offer_id: 2, owner_username: "zuza", my: { weekday: "Środa" } }),
];

const ids = (list: { offer_id: number }[]) => list.map((o) => o.offer_id);

describe("filterMarket", () => {
  it("sorts by newest first by default and oldest on request", () => {
    expect(ids(filterMarket(offers, EMPTY_FILTERS))).toEqual([3, 2, 1]);
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, sort: "old" }))).toEqual([1, 2, 3]);
  });

  it("filters by course and by day of the offered group", () => {
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, courseId: "AISDI" }))).toEqual([3]);
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, day: "SR" }))).toEqual([3, 2]);
  });

  it("searches course, owner and lecturers case-insensitively", () => {
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, query: "KOWALSKA" }))).toEqual([1]);
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, query: "algo" }))).toEqual([3]);
    expect(ids(filterMarket(offers, { ...EMPTY_FILTERS, query: "zuza" }))).toEqual([2]);
  });
});

it("hasActiveFilters ignores the sort order", () => {
  expect(hasActiveFilters({ ...EMPTY_FILTERS, sort: "old" })).toBe(false);
  expect(hasActiveFilters({ ...EMPTY_FILTERS, day: "PN" })).toBe(true);
});

it("courseOptions lists each course once, sorted by name", () => {
  expect(courseOptions(offers).map((o) => o.label)).toEqual(["Algorytmy", "Projekt aplikacyjny"]);
});
