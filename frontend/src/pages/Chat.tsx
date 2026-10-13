import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOfferComments } from "../apiFunctions/getOfferComments";
import { createOfferComment } from "../apiFunctions/createOfferComment";
import { queryKeys } from "../config/queryKeys";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { partnerOf, useFetchFinalizedOffers } from "../hooks/useFetchFinalizedOffers";
import { useAuthContext } from "../providers/authContext";
import { useToast } from "../components/ui/toastContext";
import { Loading } from "../components/ui/Loading";
import { toGroupView } from "../utils/groupView";
import { statusOf } from "../utils/apiError";
import "./exchanges.scss";

export const MAX_COMMENT_LENGTH = 255;

function ChatPage() {
  const offerId = Number(useParams().offerId);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  const { finalizedOffers } = useFetchFinalizedOffers();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: comments, error } = useQuery({
    queryKey: queryKeys.comments(offerId),
    queryFn: () => getOfferComments(offerId),
    retry: (count, err) => statusOf(err) !== 403 && statusOf(err) !== 404 && count < 2,
  });

  const send = useMutation({
    mutationFn: (text: string) => createOfferComment({ offer_id: offerId, text }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(offerId) });
    },
    onError: (err) =>
      toast.show(
        statusOf(err) === 403 ? "Czat jest dostępny tylko dla uczestników tej wymiany." : "Nie udało się wysłać wiadomości.",
        "error"
      ),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [comments]);

  const offer = finalizedOffers?.find((o) => o.offer_id === offerId);
  const forbidden = statusOf(error) === 403 || statusOf(error) === 404;
  const tooLong = draft.length > MAX_COMMENT_LENGTH;
  const cantSend = !draft.trim() || tooLong || send.isPending;

  const back = (
    <button type="button" className="link" onClick={() => navigate("/finalizedOffers")}>
      ← Zakończone wymiany
    </button>
  );

  if (forbidden || (finalizedOffers && !offer)) {
    return (
      <div className="page">
        <div className="back-head">{back}</div>
        <div className="empty plain">Czat jest dostępny tylko dla uczestników zakończonej wymiany.</div>
      </div>
    );
  }
  if (!offer) return <Loading />;

  const old = toGroupView(offer.my_course.groups[0]);
  const neu = toGroupView(offer.wanted_course.groups[0]);
  const partner = partnerOf(offer, currentUser?.username);

  return (
    <div className="page" style={{ gap: 20 }}>
      <div className="back-head">
        {back}
        <h1 className="page-title" style={{ fontSize: 32 }}>
          {offer.my_course.course_name}
        </h1>
        <p className="lead">
          Wymiana z {partner} · {old.type}
        </p>
      </div>
      <div className="chat-layout">
        <div className="chat">
          <div className="chat-messages" aria-live="polite">
            {!comments && <Loading />}
            {comments?.length === 0 && <div className="none">Brak wiadomości. Napisz pierwszy.</div>}
            {comments?.map((comment, index) => {
              const mine = comment.username === currentUser?.username;
              return (
                <div key={index} className={`msg ${mine ? "mine" : ""}`}>
                  <span className="author">{mine ? "Ty" : comment.username}</span>
                  <div className="bubble">{comment.text}</div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              if (!cantSend) send.mutate(draft.trim());
            }}
          >
            <textarea
              className="input"
              rows={3}
              placeholder="Napisz wiadomość…"
              aria-label="Wiadomość"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div>
              <span className={`counter ${tooLong ? "over" : ""}`}>
                {draft.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button type="submit" className="btn primary sm" disabled={cantSend}>
                Wyślij
              </button>
            </div>
          </form>
        </div>
        <div className="card chat-info">
          <span className="eyebrow">Wymiana</span>
          <div className="stack" style={{ gap: 3 }}>
            <span className="old">
              {old.dayShort} {old.time} · gr. {old.num}
            </span>
            <span className="new">
              {neu.dayShort} {neu.time} · gr. {neu.num}
            </span>
          </div>
          <span className="lecturers">{neu.lecturers}</span>
          <span className="note">Czat jest dostępny tylko dla uczestników tej wymiany.</span>
        </div>
      </div>
    </div>
  );
}

export const Chat = withPrivateRoute(ChatPage);
