import { groupKey, opponentGroups } from "./wizard";
import { group } from "../test/fixtures";

describe("opponentGroups", () => {
  const mine = group({ group_number: 102 });
  const groups = [
    group({ group_number: 101 }),
    group({ group_number: 102 }),
    group({ group_number: 103 }),
    group({ group_number: 103 }), // the same meeting returned twice
    group({ group_number: 103, weekday: "Piątek" }), // the group meets twice a week
    group({ group_number: 1, class_type_name: "Ćwiczenia" }),
  ];

  it("offers other groups of the same class type, one per meeting", () => {
    expect(opponentGroups(groups, "Laboratorium", mine).map(groupKey)).toEqual([
      "101|Poniedziałek|10:15",
      "103|Poniedziałek|10:15",
      "103|Piątek|10:15",
    ]);
  });

  it("handles missing data", () => {
    expect(opponentGroups(undefined, "Laboratorium", mine)).toEqual([]);
  });
});
