import { isAxiosError } from "axios";

export function statusOf(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

// Polish message for a failed offer action, based on the backend's status codes.
export function offerErrorMessage(error: unknown): string {
  switch (statusOf(error)) {
    case 403:
      return "Nie możesz wykonać tej operacji — nie jesteś w wymaganej grupie.";
    case 404:
      return "Ta oferta już nie istnieje.";
    case 409:
      return "Oferta zmieniła stan. Odśwież widok i spróbuj ponownie.";
    case 400:
      return "Nieprawidłowa oferta.";
    default:
      return "Coś poszło nie tak. Spróbuj ponownie.";
  }
}
