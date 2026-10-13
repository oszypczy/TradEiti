import { useQuery } from "@tanstack/react-query";
import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import "./OfferRequests.scss";
import { OfferRequestsList } from "./OfferRequestsList";
import { getOfferRequests } from "../../apiFunctions/getOfferRequests";
import { queryKeys } from "../../config/queryKeys";

function OfferRequests() {
  const { data: offerRequests } = useQuery({
    queryKey: queryKeys.receivedOffers,
    queryFn: getOfferRequests,
  });
  return (
    <div>
      <OfferRequestsList offerRequests={offerRequests} />
    </div>
  );
}

export const PrivateOfferRequests = withPrivateRoute(OfferRequests);
