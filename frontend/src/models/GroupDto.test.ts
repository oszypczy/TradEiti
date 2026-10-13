import { describe, expect, it } from "vitest";
import { isSameGroup } from "./GroupDto";
import { group } from "../test/fixtures";

describe("isSameGroup", () => {
  it("compares group, class type and time but not lecturers", () => {
    expect(isSameGroup(group(), group({ lecturers: ["Ktoś inny"] }))).toBe(true);
    expect(isSameGroup(group(), group({ group_number: 2 }))).toBe(false);
    expect(isSameGroup(group(), group({ class_type_name: "Ćwiczenia" }))).toBe(false);
    expect(isSameGroup(group(), group({ start_time: "12:15" }))).toBe(false);
  });

  it("is false when either side is missing", () => {
    expect(isSameGroup(group(), undefined)).toBe(false);
    expect(isSameGroup(null, group())).toBe(false);
  });
});
