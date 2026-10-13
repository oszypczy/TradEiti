import { describe, expect, it } from "vitest";
import { filterOffers } from "./filterOffers";
import { offer, course, group } from "../../test/fixtures";

const offers = [
  offer({ offer_id: "1" }),
  offer({
    offer_id: "2",
    my_course: course({
      course_id: "OTHER",
      course_name: "Analiza",
      groups: [group({ lecturers: ["Anna Nowak", "Piotr Zieliński"] })],
    }),
  }),
  offer({ offer_id: "3", my: { weekday: "Wtorek", start_time: "08:15", end_time: "10:00" } }),
];

const ids = (list: { offer_id: string }[]) => list.map((o) => o.offer_id);

describe("filterOffers", () => {
  it("returns everything when no filter is set", () => {
    expect(ids(filterOffers({}, offers))).toEqual(["1", "2", "3"]);
    expect(
      ids(filterOffers({ course_id: "", course_name: "", lecturer: "", date: "" }, offers))
    ).toEqual(["1", "2", "3"]);
  });

  it("filters by course id and name", () => {
    expect(ids(filterOffers({ course_id: "OTHER" }, offers))).toEqual(["2"]);
    expect(ids(filterOffers({ course_name: "Projekt aplikacyjny" }, offers))).toEqual(["1", "3"]);
  });

  it("filters by any of the lecturers", () => {
    expect(ids(filterOffers({ lecturer: "Piotr Zieliński" }, offers))).toEqual(["2"]);
  });

  it("filters by the formatted date", () => {
    expect(ids(filterOffers({ date: "Wtorek, 08:15-10:00" }, offers))).toEqual(["3"]);
  });

  it("combines filters", () => {
    expect(
      ids(filterOffers({ course_id: "OTHER", date: "Wtorek, 08:15-10:00" }, offers))
    ).toEqual([]);
  });

  it("does not modify the input", () => {
    const input = [...offers];
    filterOffers({ course_id: "OTHER" }, input);
    expect(input).toHaveLength(3);
  });
});
