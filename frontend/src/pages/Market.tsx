import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFittingOffers, getOffers } from "../apiFunctions/getOffers";
import { getAllCourses } from "../apiFunctions/getAllCourses";
import { requestOffer } from "../apiFunctions/requestOffer";
import { queryKeys } from "../config/queryKeys";
import { OfferStatus } from "../models/enums/OfferStatus";
import { OfferDto } from "../models/Offer";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { useAuthContext } from "../providers/authContext";
import { useToast } from "../components/ui/toastContext";
import { Ticket } from "../components/ui/Ticket";
import { Exchange } from "../components/ui/Slot";
import { Owner } from "../components/ui/Owner";
import { Loading } from "../components/ui/Loading";
import { DAY_FILTERS, findUserGroup, toGroupView } from "../utils/groupView";
import { courseOptions, EMPTY_FILTERS, filterMarket, hasActiveFilters, MarketFilters } from "../utils/marketFilters";
import { offerErrorMessage } from "../utils/apiError";
import "./offers.scss";

function MarketPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "fit" ? "fit" : "all";
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_FILTERS);

  const { data: all } = useQuery({
    queryKey: queryKeys.matchingOffers(OfferStatus.PENDING),
    queryFn: () => getOffers(OfferStatus.PENDING),
  });
  const { data: fitting } = useQuery({
    queryKey: queryKeys.fittingOffers(OfferStatus.PENDING),
    queryFn: () => getFittingOffers(OfferStatus.PENDING),
  });
  const { data: courses } = useQuery({ queryKey: queryKeys.courses, queryFn: getAllCourses });

  const me = currentUser?.username;
  const fitIds = useMemo(
    () => new Set((fitting ?? []).filter((o) => o.owner_username !== me).map((o) => o.offer_id)),
    [fitting, me]
  );

  const request = useMutation({
    mutationFn: (offer: OfferDto) => requestOffer(offer.offer_id),
    onSuccess: (_, offer) => toast.show(`Prośba o wymianę wysłana do ${offer.owner_username}`),
    onError: (error) => toast.show(offerErrorMessage(error), "error"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers }),
  });

  const visible = useMemo(() => {
    const base = (all ?? []).filter((offer) => tab === "all" || fitIds.has(offer.offer_id));
    return filterMarket(base, filters);
  }, [all, tab, fitIds, filters]);

  const setTab = (next: "all" | "fit") => setSearchParams(next === "fit" ? { tab: "fit" } : {});
  const update = (patch: Partial<MarketFilters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Rynek ofert</h1>
          <p className="lead">Oferty wymian wystawione przez innych studentów.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => navigate("/myOffers/new")}>
          + Dodaj ofertę
        </button>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")}>
          Wszystkie <span className="count">{all?.length ?? "–"}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "fit"} onClick={() => setTab("fit")}>
          Pasujące do mnie <span className="count fit">{fitting ? fitIds.size : "–"}</span>
        </button>
      </div>

      <div className="filters">
        <input
          className="input sm search"
          placeholder="Szukaj: przedmiot, prowadzący, użytkownik"
          aria-label="Szukaj"
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
        />
        <select
          className="input sm course"
          aria-label="Przedmiot"
          value={filters.courseId}
          onChange={(e) => update({ courseId: e.target.value })}
        >
          <option value="">Wszystkie przedmioty</option>
          {courseOptions(all ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="days" role="group" aria-label="Dzień">
          {DAY_FILTERS.map((day) => (
            <button
              key={day.value}
              type="button"
              className="chip"
              aria-pressed={filters.day === day.value}
              onClick={() => update({ day: day.value })}
            >
              {day.label}
            </button>
          ))}
        </div>
        <select
          className="input sm"
          aria-label="Sortowanie"
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as MarketFilters["sort"] })}
        >
          <option value="new">Od najnowszych</option>
          <option value="old">Od najstarszych</option>
        </select>
        {hasActiveFilters(filters) && (
          <button type="button" className="link" onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}>
            Resetuj
          </button>
        )}
      </div>

      {!all ? (
        <Loading text="Ładowanie ofert…" />
      ) : (
        <div className="stack">
          {visible.map((offer) => {
            const own = offer.owner_username === me;
            const fits = fitIds.has(offer.offer_id);
            const give = toGroupView(offer.my_course.groups[0]);
            const want = toGroupView(offer.wanted_course.groups[0]);
            const myGroup = findUserGroup(courses, offer.wanted_course.course_id, want.type);
            return (
              <Ticket
                key={offer.offer_id}
                courseName={offer.my_course.course_name}
                courseId={offer.my_course.course_id}
                classType={give.type}
                tone={own ? "green" : fits ? "blue" : "neutral"}
                aside={<Owner username={offer.owner_username} label={own ? "Ty" : offer.owner_username} />}
                stub={
                  own ? (
                    <>
                      <span className="pill green">Twoja oferta</span>
                      <span className="note">Zarządzaj nią w zakładce Moje oferty.</span>
                    </>
                  ) : fits ? (
                    <>
                      <button
                        type="button"
                        className="btn primary"
                        style={{ height: 42, borderRadius: 10 }}
                        disabled={request.isPending}
                        onClick={() => request.mutate(offer)}
                      >
                        Wyślij prośbę
                      </button>
                      <span className="fits">Pasuje — jesteś w gr. {want.num}</span>
                    </>
                  ) : (
                    <span className="note">
                      Szuka osoby z gr. {want.num}.
                      {myGroup ? ` Ty jesteś w gr. ${myGroup.group_number}.` : ""}
                    </span>
                  )
                }
              >
                <Exchange
                  give={give}
                  want={want}
                  giveLabel={own ? "Oddajesz" : "Oddaje"}
                  wantLabel={own ? "Chcesz" : "Chce"}
                />
              </Ticket>
            );
          })}
          {visible.length === 0 && (
            <div className="empty">
              {hasActiveFilters(filters) ? "Brak ofert dla tych filtrów" : "Brak ofert w Twoich przedmiotach"}
              {hasActiveFilters(filters) && (
                <button type="button" className="link" style={{ fontSize: 14 }} onClick={() => setFilters(EMPTY_FILTERS)}>
                  Wyczyść filtry
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Market = withPrivateRoute(MarketPage);
