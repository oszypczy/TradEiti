import { useQuery } from "@tanstack/react-query";
import { getFittingOffers } from "../apiFunctions/getOffers";
import { getUserOffers } from "../apiFunctions/getUserOffers";
import { queryKeys } from "../config/queryKeys";
import { OfferStatus } from "../models/enums/OfferStatus";
import { useAuthContext } from "../providers/authContext";

// Counters for the sidebar badges: offers the user can accept and requests waiting for their approval.
export function useNavCounts() {
  const { currentUser, connectedToUsos } = useAuthContext();
  const enabled = Boolean(connectedToUsos);
  const { data: fitting } = useQuery({
    queryKey: queryKeys.fittingOffers(OfferStatus.PENDING),
    queryFn: () => getFittingOffers(OfferStatus.PENDING),
    enabled,
  });
  const { data: owned } = useQuery({ queryKey: queryKeys.userOffers, queryFn: getUserOffers, enabled });
  return {
    fitting: fitting?.filter((offer) => offer.owner_username !== currentUser?.username).length ?? 0,
    approvals: owned?.filter((offer) => offer.state === OfferStatus.REQUEST_SENT).length ?? 0,
  };
}
