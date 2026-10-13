import { getMultipleValuesFromSessionStorage } from "../../common/sessionStorage";
import { FormOffer } from "../../models/form/FormOffer";

// Restores the wizard state saved in session storage (survives page reloads)
export function getDefaultOfferFormValues(): FormOffer {
  return getMultipleValuesFromSessionStorage([
    "course",
    "group",
    "myHour",
    "opponentHour",
  ]) as unknown as FormOffer;
}
