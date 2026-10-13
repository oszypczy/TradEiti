import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MyOfferComponent } from "./MyOffer";
import { offer } from "../../test/fixtures";
import { OfferStatus } from "../../models/enums/OfferStatus";
import { axiosBase } from "../../config/axiosConfig";

function renderOffer(state: OfferStatus) {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <MyOfferComponent offer={offer({ offer_id: "42", state })} />
    </QueryClientProvider>
  );
}

describe("MyOfferComponent", () => {
  it("lets the owner withdraw a pending offer but not approve it", () => {
    renderOffer(OfferStatus.PENDING);
    expect(screen.getByText(/Oczekuje/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zatwierdź ofertę" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Wycofaj ofertę" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Odrzuć ofertę" })).not.toBeInTheDocument();
  });

  it("lets the owner approve or reject a received request", () => {
    renderOffer(OfferStatus.REQUEST_SENT);
    expect(screen.getByRole("button", { name: "Zatwierdź ofertę" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Odrzuć ofertę" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Wycofaj ofertę" })).not.toBeInTheDocument();
  });

  it("calls the accept endpoint", async () => {
    const patch = vi.spyOn(axiosBase, "patch").mockResolvedValue({ data: "ok" });
    renderOffer(OfferStatus.REQUEST_SENT);
    await userEvent.click(screen.getByRole("button", { name: "Zatwierdź ofertę" }));
    expect(patch).toHaveBeenCalledWith("/offers/accept/42");
    patch.mockRestore();
  });

  it("alerts when the backend rejects the transition", async () => {
    const patch = vi.spyOn(axiosBase, "patch").mockRejectedValue(new Error("409"));
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderOffer(OfferStatus.REQUEST_SENT);
    await userEvent.click(screen.getByRole("button", { name: "Odrzuć ofertę" }));
    expect(patch).toHaveBeenCalledWith("/offers/reject/42");
    expect(alert).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
