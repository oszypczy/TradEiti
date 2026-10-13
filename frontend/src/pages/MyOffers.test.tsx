import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyOfferCard } from "./MyOffers";
import { offer } from "../test/fixtures";
import { OfferStatus } from "../models/enums/OfferStatus";

describe("MyOfferCard", () => {
  it("lets the owner withdraw a pending offer", async () => {
    const onAction = vi.fn();
    render(<MyOfferCard offer={offer({ my: { weekday: "Środa", group_number: 103 } })} onAction={onAction} busy={false} />);

    expect(screen.getByText("Oczekuje na chętnego")).toBeInTheDocument();
    expect(screen.getByText("Środa · gr. 103")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zatwierdź wymianę" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Wycofaj ofertę" }));
    expect(onAction).toHaveBeenCalledWith("withdraw");
  });

  it("shows who sent a request and lets the owner approve or reject it", async () => {
    const onAction = vi.fn();
    render(
      <MyOfferCard
        offer={offer({ state: OfferStatus.REQUEST_SENT, receiver_username: "olek" })}
        onAction={onAction}
        busy={false}
      />
    );

    expect(screen.getByText("Prośba od olek")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Zatwierdź wymianę" }));
    await userEvent.click(screen.getByRole("button", { name: "Odrzuć" }));
    expect(onAction.mock.calls).toEqual([["approve"], ["reject"]]);
  });

  it("disables actions while a request is in flight", () => {
    render(<MyOfferCard offer={offer()} onAction={() => {}} busy />);
    expect(screen.getByRole("button", { name: "Wycofaj ofertę" })).toBeDisabled();
  });
});
