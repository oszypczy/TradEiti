import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseHours } from "./CourseHours";
import { group } from "../../test/fixtures";

const mine = group({ group_number: 1, start_time: "08:15" });
const other = group({ group_number: 2, start_time: "10:15" });

describe("CourseHours", () => {
  it("marks the selected entry and blocks the excluded one", async () => {
    const onChoose = vi.fn();
    render(
      <CourseHours
        dates={[mine, other]}
        hourType="opponentHour"
        selected={other}
        excluded={mine}
        handleChooseDate={onChoose}
      />
    );
    const [mineRadio, otherRadio] = screen.getAllByRole("radio");
    expect(otherRadio).toBeChecked();
    expect(mineRadio).toBeDisabled();

    await userEvent.click(screen.getByText(/08:15/));
    expect(onChoose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText(/10:15/));
    expect(onChoose).toHaveBeenCalledWith(other, "opponentHour");
  });
});
