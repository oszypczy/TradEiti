import { useSearchParams } from "react-router-dom";
import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import "./MyOffers.scss";
import { ShowOffers } from "./ShowOffers";
import { MyOffersSteps } from "./MyOffersSteps";
import { AddOffer } from "./AddOffer";

const stages = ["1. Wybór przedmiotu", "2. Wybór godziny", "3. Finalizacja"];

const MyOffers = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const stage = searchParams.get("stage");
  if (page !== MyOffersSteps.MY_OFFERS_ADD) {
    return <ShowOffers />;
  }
  return (
    <>
      <div className="stageDiv">
        {stages.map((title, index) => (
          <div
            key={title}
            className={`addStage ${stage === String(index + 1) ? "currentStage" : ""}`}
          >
            {title}
          </div>
        ))}
      </div>
      <hr />
      <br />
      <AddOffer />
    </>
  );
};

export const PrivateMyOffers = withPrivateRoute(MyOffers);
