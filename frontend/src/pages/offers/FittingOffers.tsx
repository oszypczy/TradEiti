import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import { getFittingOffers } from "../../apiFunctions/getOffers";
import { OfferStatus } from "../../models/enums/OfferStatus";
import { queryKeys } from "../../config/queryKeys";
import { OffersBrowser } from "./OffersBrowser";

const FittingOffers = () => (
  <OffersBrowser
    queryKey={queryKeys.fittingOffers(OfferStatus.PENDING)}
    queryFn={() => getFittingOffers(OfferStatus.PENDING)}
  />
);

export const PrivateFittingOffers = withPrivateRoute(FittingOffers);
