import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOfferRequests } from "../apiFunctions/getOfferRequests";
import { queryKeys } from "../config/queryKeys";
import { OfferStatus } from "../models/enums/OfferStatus";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { Loading } from "../components/ui/Loading";
import { toGroupView } from "../utils/groupView";
import "./offers.scss";

function RequestsPage() {
  const navigate = useNavigate();
  const { data: requests } = useQuery({ queryKey: queryKeys.receivedOffers, queryFn: getOfferRequests });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Wysłane oferty</h1>
          <p className="lead">Oferty innych, na które wysłałeś prośbę o wymianę.</p>
        </div>
      </div>
      {!requests ? (
        <Loading />
      ) : (
        <div className="request-list">
          {requests.map((offer) => {
            // You give the group the owner wants and receive the one they offer.
            const give = toGroupView(offer.wanted_course.groups[0]);
            const get = toGroupView(offer.my_course.groups[0]);
            const done = offer.state === OfferStatus.COMPLETED;
            return (
              <div key={offer.offer_id} className="row">
                <div className="title">
                  <b>{offer.my_course.course_name}</b>
                  <span>
                    {get.type} · od {offer.owner_username}
                  </span>
                </div>
                <div className="swap">
                  <span className="give">
                    {give.dayShort} {give.time} · gr. {give.num}
                  </span>
                  <span className="muted">→</span>
                  <span className="get">
                    {get.dayShort} {get.time} · gr. {get.num}
                  </span>
                </div>
                <div className="status">
                  <span className={`pill ${done ? "green" : "amber"}`}>{done ? "Zaakceptowana" : "Czeka na zatwierdzenie"}</span>
                  {done && (
                    <button type="button" className="link" onClick={() => navigate(`/finalizedOffers/${offer.offer_id}`)}>
                      Zobacz →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {requests.length === 0 && <div className="empty plain">Brak ofert będących w trakcie procesu wymiany.</div>}
        </div>
      )}
    </div>
  );
}

export const Requests = withPrivateRoute(RequestsPage);
