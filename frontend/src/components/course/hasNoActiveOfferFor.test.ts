import { describe, expect, it } from "vitest";
import { hasNoActiveOfferFor } from "./hasNoActiveOfferFor";
import { offer } from "../../test/fixtures";
import { OfferStatus } from "../../models/enums/OfferStatus";

const COURSE = "103A-INxxx-ISP-PAP";

describe("hasNoActiveOfferFor", () => {
  it("allows a new offer when offers are not loaded or empty", () => {
    expect(hasNoActiveOfferFor(undefined, COURSE, "Laboratorium")).toBe(true);
    expect(hasNoActiveOfferFor([], COURSE, "Laboratorium")).toBe(true);
  });

  it.each([OfferStatus.PENDING, OfferStatus.REQUEST_SENT])(
    "blocks when a %s offer exists for the same course and class type",
    (state) => {
      expect(hasNoActiveOfferFor([offer({ state })], COURSE, "Laboratorium")).toBe(false);
    }
  );

  it("ignores completed offers", () => {
    const offers = [offer({ state: OfferStatus.COMPLETED })];
    expect(hasNoActiveOfferFor(offers, COURSE, "Laboratorium")).toBe(true);
  });

  it("only matches the same class type and course", () => {
    const offers = [offer()];
    expect(hasNoActiveOfferFor(offers, COURSE, "Ćwiczenia")).toBe(true);
    expect(hasNoActiveOfferFor(offers, "OTHER", "Laboratorium")).toBe(true);
  });
});
