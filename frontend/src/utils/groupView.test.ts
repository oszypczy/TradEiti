import { avatarColors, findUserGroup, groupsByType, toGroupView } from "./groupView";
import { course, group } from "../test/fixtures";

describe("toGroupView", () => {
  it("formats day, time, group and lecturers", () => {
    expect(
      toGroupView(group({ weekday: "Środa", start_time: "12:15", end_time: "14:00", group_number: 103, lecturers: ["A B", "C D"] }))
    ).toEqual({
      num: 103,
      type: "Laboratorium",
      day: "SR",
      dayShort: "ŚR",
      dayLong: "Środa",
      time: "12:15–14:00",
      lecturers: "A B, C D",
    });
  });

  it("is safe for a missing group", () => {
    expect(toGroupView(undefined).dayShort).toBe("–");
  });
});

describe("findUserGroup / groupsByType", () => {
  const proi = course({
    course_id: "PROI",
    groups: [
      group({ class_type_name: "Ćwiczenia", group_number: 1 }),
      group({ class_type_name: "Laboratorium", group_number: 102 }),
      group({ class_type_name: "Laboratorium", group_number: 102, weekday: "Piątek" }),
    ],
  });

  it("finds the user's group of a class type", () => {
    expect(findUserGroup([proi], "PROI", "Laboratorium")?.group_number).toBe(102);
    expect(findUserGroup([proi], "PROI", "Projekt")).toBeUndefined();
    expect(findUserGroup(undefined, "PROI", "Laboratorium")).toBeUndefined();
  });

  it("lists every class type once", () => {
    expect(groupsByType(proi).map((g) => g.class_type_name)).toEqual(["Ćwiczenia", "Laboratorium"]);
  });
});

it("avatarColors is stable per name", () => {
  expect(avatarColors("ania")).toEqual(avatarColors("ania"));
});
