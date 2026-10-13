import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import { getOffers } from "../../apiFunctions/getOffers";
import { OfferStatus } from "../../models/enums/OfferStatus";
import { queryKeys } from "../../config/queryKeys";
import { OffersBrowser } from "./OffersBrowser";

const Offers = () => (
  <OffersBrowser
    queryKey={queryKeys.matchingOffers(OfferStatus.PENDING)}
    queryFn={() => getOffers(OfferStatus.PENDING)}
  />
);

export const PrivateOffers = withPrivateRoute(Offers);
