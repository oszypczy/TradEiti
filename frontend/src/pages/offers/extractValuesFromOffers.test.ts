import { describe, expect, it } from "vitest";
import {
  extractDatesFromOffers,
  extractLecturersFromOffers,
  extractSimpleValuesFromOffers,
  formatOfferDate,
} from "./extractValuesFromOffers";
import { course, group, offer } from "../../test/fixtures";

const offers = [
  offer({ my_course: course({ course_id: "B", groups: [group({ lecturers: ["Zenon", "Adam"] })] }) }),
  offer({ my_course: course({ course_id: "A", groups: [group({ lecturers: ["Adam"] })] }) }),
  offer({ my_course: course({ course_id: "B", groups: [group({ weekday: "Środa" })] }) }),
];

describe("extractValuesFromOffers", () => {
  it("returns unique sorted values with an empty 'no filter' option first", () => {
    expect(extractSimpleValuesFromOffers("course_id", offers)).toEqual(["", "A", "B"]);
  });

  it("collects lecturers from all offers", () => {
    expect(extractLecturersFromOffers(offers)).toEqual(["", "Adam", "Jan Kowalski", "Zenon"]);
  });

  it("formats and de-duplicates dates", () => {
    expect(formatOfferDate(offers[0])).toBe("Poniedziałek, 10:15-12:00");
    expect(extractDatesFromOffers(offers)).toEqual([
      "",
      "Poniedziałek, 10:15-12:00",
      "Środa, 10:15-12:00",
    ]);
  });

  it("handles no offers", () => {
    expect(extractSimpleValuesFromOffers("course_name", [])).toEqual([""]);
    expect(extractLecturersFromOffers([])).toEqual([""]);
    expect(extractDatesFromOffers([])).toEqual([""]);
  });
});
