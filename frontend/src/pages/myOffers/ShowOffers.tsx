import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MyOffersList } from "../../components/offer/MyOffersList";
import { MyOffersSteps } from "./MyOffersSteps";
import { getUserOffers } from "../../apiFunctions/getUserOffers";
import { OfferStatus } from "../../models/enums/OfferStatus";
import { queryKeys } from "../../config/queryKeys";

export function ShowOffers() {
  const [, setSearchParams] = useSearchParams();
  const { data: offers } = useQuery({
    queryKey: queryKeys.userOffers,
    queryFn: getUserOffers,
  });

  const handleAddOffer = () => {
    setSearchParams({
      page: MyOffersSteps.MY_OFFERS_ADD,
      stage: `1`,
    });
  };

  const offersToShow = offers?.filter(
    (offer) => offer.state !== OfferStatus.COMPLETED
  );
  return (
    <>
      <button className="offerButton" onClick={handleAddOffer}>
        Dodaj ofertę <b>+</b>
      </button>
      <MyOffersList offers={offersToShow} />
    </>
  );
}
