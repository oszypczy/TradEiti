import { describe, expect, it } from "vitest";
import { getCourseDateFromCourses } from "./GetCourseDateFromCourses";
import { course, group } from "../../test/fixtures";

const courses = [
  course({
    groups: [
      group({ class_type_name: "Ćwiczenia", group_number: 3 }),
      group({ class_type_name: "Laboratorium", group_number: 7 }),
    ],
  }),
];

describe("getCourseDateFromCourses", () => {
  it("returns the user's group of the requested class type", () => {
    const result = getCourseDateFromCourses(courses, "103A-INxxx-ISP-PAP", "Laboratorium");
    expect(result).toHaveLength(1);
    expect(result?.[0].group_number).toBe(7);
  });

  it("returns undefined for missing parameters, course or class type", () => {
    expect(getCourseDateFromCourses(courses, null, "Laboratorium")).toBeUndefined();
    expect(getCourseDateFromCourses(courses, "103A-INxxx-ISP-PAP", null)).toBeUndefined();
    expect(getCourseDateFromCourses(undefined, "103A-INxxx-ISP-PAP", "Laboratorium")).toBeUndefined();
    expect(getCourseDateFromCourses(courses, "OTHER", "Laboratorium")).toBeUndefined();
    expect(getCourseDateFromCourses(courses, "103A-INxxx-ISP-PAP", "Projekt")).toBeUndefined();
  });
});
