import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfferRequest } from "./OfferRequest";
import { offer } from "../../test/fixtures";
import { OfferStatus } from "../../models/enums/OfferStatus";

describe("OfferRequest", () => {
  it.each([
    [OfferStatus.REQUEST_SENT, "Prośba wysłana"],
    [OfferStatus.COMPLETED, "Zaakceptowana"],
  ])("shows the label for %s", (state, label) => {
    render(<OfferRequest offerRequest={offer({ state })} />);
    expect(screen.getByText("Projekt aplikacyjny")).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
