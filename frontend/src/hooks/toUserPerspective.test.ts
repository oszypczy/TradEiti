import { describe, expect, it } from "vitest";
import { toUserPerspective } from "./useFetchFinalizedOffers";
import { offer } from "../test/fixtures";

describe("toUserPerspective", () => {
  const completed = offer({ owner_username: "alice", receiver_username: "bob" });

  it("keeps offers owned by the user as they are", () => {
    const [result] = toUserPerspective([completed], "alice");
    expect(result).toBe(completed);
  });

  it("swaps courses for the receiver", () => {
    const [result] = toUserPerspective([completed], "bob");
    expect(result.my_course).toBe(completed.wanted_course);
    expect(result.wanted_course).toBe(completed.my_course);
  });

  it("does not mutate the input, so repeated calls are stable", () => {
    const input = [completed];
    const first = toUserPerspective(input, "bob");
    const second = toUserPerspective(input, "bob");
    expect(second[0].my_course).toBe(first[0].my_course);
    expect(input[0].my_course.groups[0].group_number).toBe(1);
  });
});
