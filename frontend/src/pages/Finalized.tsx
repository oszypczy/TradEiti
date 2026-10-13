import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOfferComments } from "../apiFunctions/getOfferComments";
import { queryKeys } from "../config/queryKeys";
import { OfferDto } from "../models/Offer";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { partnerOf, useFetchFinalizedOffers } from "../hooks/useFetchFinalizedOffers";
import { useAuthContext } from "../providers/authContext";
import { Loading } from "../components/ui/Loading";
import { toGroupView } from "../utils/groupView";
import "./exchanges.scss";

function ExchangeCard({ offer }: { offer: OfferDto }) {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { data: comments } = useQuery({
    queryKey: queryKeys.comments(offer.offer_id),
    queryFn: () => getOfferComments(offer.offer_id),
  });
  const old = toGroupView(offer.my_course.groups[0]);
  const neu = toGroupView(offer.wanted_course.groups[0]);

  return (
    <div className="card exchange-card">
      <div className="head">
        <div className="stack" style={{ gap: 3, minWidth: 0 }}>
          <span className="card-title">{offer.my_course.course_name}</span>
          <span className="course-code">{offer.my_course.course_id}</span>
        </div>
        <span className="pill green">Zakończona</span>
      </div>
      <div className="groups">
        <div className="old">
          <span className="eyebrow">Stara grupa</span>
          <span className="time">
            {old.dayShort} {old.time}
          </span>
          <span className="detail">
            gr. {old.num} · {old.lecturers}
          </span>
        </div>
        <div className="new">
          <span className="eyebrow">Nowa grupa</span>
          <span className="time">
            {neu.dayShort} {neu.time}
          </span>
          <span className="detail">
            gr. {neu.num} · {neu.lecturers}
          </span>
        </div>
      </div>
      <div className="foot">
        <span>
          {old.type} · z {partnerOf(offer, currentUser?.username)}
        </span>
        <button type="button" className="btn secondary sm" onClick={() => navigate(`/finalizedOffers/${offer.offer_id}`)}>
          Czat{comments ? ` · ${comments.length}` : ""}
        </button>
      </div>
    </div>
  );
}

function FinalizedPage() {
  const { finalizedOffers } = useFetchFinalizedOffers();
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Zakończone wymiany</h1>
          <p className="lead">Zatwierdzone wymiany. Szczegóły ustalisz na czacie z drugą osobą.</p>
        </div>
      </div>
      {!finalizedOffers ? (
        <Loading />
      ) : finalizedOffers.length === 0 ? (
        <div className="empty plain">Brak zakończonych wymian.</div>
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {finalizedOffers.map((offer) => (
            <ExchangeCard key={offer.offer_id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Finalized = withPrivateRoute(FinalizedPage);
