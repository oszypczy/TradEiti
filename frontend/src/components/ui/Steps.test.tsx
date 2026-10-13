import { render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

it("marks finished, current and upcoming steps", () => {
  render(<Steps labels={["Przedmiot", "Godziny", "Podsumowanie"]} current={1} />);
  const items = screen.getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("✓Przedmiot");
  expect(items[1]).toHaveAttribute("aria-current", "step");
  expect(items[2]).toHaveTextContent("3Podsumowanie");
});
