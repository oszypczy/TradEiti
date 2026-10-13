import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import "./style.scss";
import { Loader } from "../../common/loader/Loader";
import { FinalizedOffer } from "../../components/finalizedOffer/FinalizedOffer";
import { useSearchParams } from "react-router-dom";
import { OfferComments } from "../../components/offerComments/OfferComments";
import { useFetchFinalizedOffers } from "../../hooks/useFetchFinalizedOffers";

function FinalizedOffers() {
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get("offer_id");
  const { finalizedOffers } = useFetchFinalizedOffers();

  if (offerId) {
    return (
      <section>
        <OfferComments offerId={offerId} />
      </section>
    );
  }

  return (
    <section>
      {!finalizedOffers ? (
        <Loader />
      ) : finalizedOffers.length > 0 ? (
        finalizedOffers.map((offer) => (
          <FinalizedOffer key={offer.offer_id} offer={offer} />
        ))
      ) : (
        <h6 className="noRequestsCom">Brak zakończonych wymian</h6>
      )}
    </section>
  );
}

export const PrivateFinalizedOffers = withPrivateRoute(FinalizedOffers);
