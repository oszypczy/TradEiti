import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllCourses } from "../apiFunctions/getAllCourses";
import { getCourseGroups } from "../apiFunctions/getCourseGroups";
import { getUserOffers } from "../apiFunctions/getUserOffers";
import { createOffer } from "../apiFunctions/createOffer";
import { queryKeys } from "../config/queryKeys";
import { CourseDto } from "../models/Course";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { useAuthContext } from "../providers/authContext";
import { useToast } from "../components/ui/toastContext";
import { Steps } from "../components/ui/Steps";
import { Ticket } from "../components/ui/Ticket";
import { Exchange, SlotBody } from "../components/ui/Slot";
import { Loading } from "../components/ui/Loading";
import { findUserGroup, groupsByType, toGroupView } from "../utils/groupView";
import { hasNoActiveOfferFor } from "../utils/hasNoActiveOfferFor";
import { groupKey, opponentGroups } from "../utils/wizard";
import { offerErrorMessage } from "../utils/apiError";
import "./wizard.scss";

const STEPS = ["Przedmiot", "Godziny", "Podsumowanie"];

function AddOfferPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const courseId = params.get("course") ?? "";
  const classType = params.get("type") ?? "";
  const oppKey = params.get("opp") ?? "";

  const { data: courses } = useQuery({ queryKey: queryKeys.courses, queryFn: getAllCourses });
  const { data: owned } = useQuery({ queryKey: queryKeys.userOffers, queryFn: getUserOffers });
  const { data: groups } = useQuery({
    queryKey: queryKeys.courseGroups(courseId),
    queryFn: () => getCourseGroups(courseId),
    enabled: courseId !== "",
  });

  const course = courses?.find((c) => c.course_id === courseId);
  const myGroup = findUserGroup(courses, courseId, classType);
  const options = opponentGroups(groups, classType, myGroup);
  const opponent = options.find((group) => groupKey(group) === oppKey);

  // Fall back to an earlier step when the URL lacks the data a step needs.
  let step = Number(params.get("step") ?? "1") - 1;
  if (step >= 1 && courses && !myGroup) step = 0;
  if (step === 2 && groups && !opponent) step = 1;

  const go = (next: Record<string, string>) => setParams(next);

  const create = useMutation({
    mutationFn: () => {
      const courseRef = { course_id: courseId, course_name: course?.course_name ?? "" };
      return createOffer({
        my_course: { ...courseRef, groups: [myGroup!] },
        wanted_course: { ...courseRef, groups: [opponent!] },
      });
    },
    onSuccess: () => {
      toast.show("Oferta została dodana");
      queryClient.invalidateQueries({ queryKey: queryKeys.offers });
      navigate("/myOffers");
    },
    onError: (error) => toast.show(offerErrorMessage(error), "error"),
  });

  const chooseType = (c: CourseDto, type: string) => go({ step: "2", course: c.course_id, type });

  return (
    <div className="page" style={{ gap: 28 }}>
      <div className="back-head">
        <button type="button" className="link" onClick={() => navigate("/myOffers")}>
          ← Moje oferty
        </button>
        <h1 className="page-title">Nowa oferta</h1>
      </div>
      <Steps labels={STEPS} current={step} />

      {((step >= 1 && !courses) || (step === 2 && !groups)) && <Loading />}

      {step === 0 &&
        (!courses ? (
          <Loading text="Pobieranie planu z USOS…" />
        ) : (
          <div className="stack" style={{ gap: 16 }}>
            <h2 className="h2">Wybierz przedmiot i rodzaj zajęć</h2>
            {courses.length === 0 && <div className="empty plain">Nie znaleźliśmy zajęć w Twoim planie.</div>}
            <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {courses.map((c) => (
                <div key={c.course_id} className="card">
                  <div className="stack" style={{ gap: 3 }}>
                    <span className="card-title">{c.course_name}</span>
                    <span className="course-code">{c.course_id}</span>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    {groupsByType(c).map((group) => {
                      const view = toGroupView(group);
                      const enabled = hasNoActiveOfferFor(owned, c.course_id, group.class_type_name);
                      return (
                        <button
                          key={group.class_type_name}
                          type="button"
                          className="type-option"
                          disabled={!enabled}
                          onClick={() => chooseType(c, group.class_type_name)}
                        >
                          <span>{group.class_type_name}</span>
                          <span className="slot-hint">
                            {enabled ? `${view.dayShort} ${view.time} · gr. ${view.num} →` : "Masz już aktywną ofertę"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {step === 1 && myGroup && (
        <div className="stack" style={{ gap: 20 }}>
          <div className="stack" style={{ gap: 4 }}>
            <h2 className="h2">
              {course?.course_name} · {classType}
            </h2>
            <span className="course-code">{courseId}</span>
          </div>
          <div className="wizard-hours">
            <div className="stack" style={{ gap: 10 }}>
              <span className="eyebrow">Oddajesz — Twoja grupa</span>
              <div className="mine">
                <SlotBody group={toGroupView(myGroup)} tone="give" />
              </div>
              <span className="note-sm muted" style={{ font: "500 12px/1.5 var(--font-body)" }}>
                Pobrane z Twojego planu w USOS.
              </span>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              <span className="eyebrow">Chcesz — wybierz grupę</span>
              {!groups ? (
                <Loading text="Pobieranie grup…" />
              ) : options.length === 0 ? (
                <div className="empty plain">Ten przedmiot nie ma innych grup tego typu.</div>
              ) : (
                <div className="options" role="radiogroup" aria-label="Grupa, którą chcesz">
                  {options.map((group) => (
                    <button
                      key={groupKey(group)}
                      type="button"
                      role="radio"
                      aria-checked={groupKey(group) === oppKey}
                      className="group-option"
                      onClick={() => go({ step: "2", course: courseId, type: classType, opp: groupKey(group) })}
                    >
                      <SlotBody group={toGroupView(group)} tone="want" />
                      <span className="dot" aria-hidden />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => go({ step: "1" })}>
              Wstecz
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!opponent}
              onClick={() => go({ step: "3", course: courseId, type: classType, opp: oppKey })}
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 2 && myGroup && opponent && (
        <div className="stack summary" style={{ gap: 20 }}>
          <h2 className="h2">Podsumowanie oferty</h2>
          <Ticket
            courseName={course?.course_name ?? ""}
            courseId={courseId}
            classType={classType}
            stub={
              <>
                <span className="eyebrow">Wystawiający</span>
                <span style={{ font: "700 15px var(--font-body)" }}>{currentUser?.username}</span>
                <span className="note-sm">Oferta będzie widoczna na rynku, dopóki jej nie wycofasz.</span>
              </>
            }
          >
            <Exchange give={toGroupView(myGroup)} want={toGroupView(opponent)} giveLabel="Oddajesz" wantLabel="Otrzymasz" />
          </Ticket>
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => go({ step: "2", course: courseId, type: classType, opp: oppKey })}>
              Wstecz
            </button>
            <button type="button" className="btn primary" disabled={create.isPending} onClick={() => create.mutate()}>
              Stwórz ofertę
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const AddOffer = withPrivateRoute(AddOfferPage);
