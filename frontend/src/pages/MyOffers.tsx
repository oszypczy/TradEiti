import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOffers } from "../apiFunctions/getUserOffers";
import { acceptOffer } from "../apiFunctions/acceptOffer";
import { rejectOffer } from "../apiFunctions/rejectOffer";
import { removeOffer } from "../apiFunctions/deleteOffer";
import { queryKeys } from "../config/queryKeys";
import { OfferStatus } from "../models/enums/OfferStatus";
import { OfferDto } from "../models/Offer";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { useToast } from "../components/ui/toastContext";
import { Ticket } from "../components/ui/Ticket";
import { Exchange } from "../components/ui/Slot";
import { Loading } from "../components/ui/Loading";
import { toGroupView } from "../utils/groupView";
import { offerErrorMessage } from "../utils/apiError";

type Action = "approve" | "reject" | "withdraw";

const ACTIONS: Record<Action, { call: (offer: OfferDto) => Promise<unknown>; done: string }> = {
  approve: { call: (offer) => acceptOffer(offer.offer_id, offer.state), done: "Wymiana zatwierdzona" },
  reject: { call: (offer) => rejectOffer(offer.offer_id), done: "Prośba odrzucona — oferta znów jest na rynku" },
  withdraw: { call: (offer) => removeOffer(offer.offer_id), done: "Oferta wycofana" },
};

export function MyOfferCard({ offer, onAction, busy }: { offer: OfferDto; onAction: (a: Action) => void; busy: boolean }) {
  const requested = offer.state === OfferStatus.REQUEST_SENT;
  const give = toGroupView(offer.my_course.groups[0]);
  return (
    <Ticket
      courseName={offer.my_course.course_name}
      courseId={offer.my_course.course_id}
      classType={give.type}
      tone={requested ? "blue" : "neutral"}
      wideStub
      stub={
        requested ? (
          <>
            <span className="pill blue">Prośba od {offer.receiver_username}</span>
            <button type="button" className="btn primary" disabled={busy} onClick={() => onAction("approve")}>
              Zatwierdź wymianę
            </button>
            <button type="button" className="btn secondary" disabled={busy} onClick={() => onAction("reject")}>
              Odrzuć
            </button>
            <span className="note-sm">Zatwierdzonej wymiany nie można cofnąć.</span>
          </>
        ) : (
          <>
            <span className="pill amber">Oczekuje na chętnego</span>
            <button type="button" className="btn danger" disabled={busy} onClick={() => onAction("withdraw")}>
              Wycofaj ofertę
            </button>
          </>
        )
      }
    >
      <Exchange give={give} want={toGroupView(offer.wanted_course.groups[0])} giveLabel="Oddajesz" wantLabel="Chcesz" />
    </Ticket>
  );
}

function MyOffersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: offers } = useQuery({ queryKey: queryKeys.userOffers, queryFn: getUserOffers });

  const mutation = useMutation({
    mutationFn: ({ offer, action }: { offer: OfferDto; action: Action }) => ACTIONS[action].call(offer),
    onSuccess: (_, { action }) => toast.show(ACTIONS[action].done),
    onError: (error) => toast.show(offerErrorMessage(error), "error"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers }),
  });

  const active = offers?.filter((offer) => offer.state !== OfferStatus.COMPLETED);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Moje oferty</h1>
          <p className="lead">Aktywne oferty, które wystawiłeś.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => navigate("/myOffers/new")}>
          + Dodaj ofertę
        </button>
      </div>
      {!active ? (
        <Loading />
      ) : active.length === 0 ? (
        <div className="empty">
          Nie masz aktywnych ofert
          <button type="button" className="btn primary sm" onClick={() => navigate("/myOffers/new")}>
            Dodaj pierwszą ofertę
          </button>
        </div>
      ) : (
        <div className="stack">
          {active.map((offer) => (
            <MyOfferCard
              key={offer.offer_id}
              offer={offer}
              busy={mutation.isPending}
              onAction={(action) => mutation.mutate({ offer, action })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const MyOffers = withPrivateRoute(MyOffersPage);
