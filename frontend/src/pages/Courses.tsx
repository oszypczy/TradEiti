import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../apiFunctions/getAllCourses";
import { queryKeys } from "../config/queryKeys";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { Loading } from "../components/ui/Loading";
import { groupsByType, toGroupView } from "../utils/groupView";

function CoursesPage() {
  const { data: courses } = useQuery({ queryKey: queryKeys.courses, queryFn: getAllCourses });
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Kursy</h1>
          <p className="lead">Twoje przedmioty i grupy w bieżącym semestrze, pobrane z USOS.</p>
        </div>
      </div>
      {!courses ? (
        <Loading text="Pobieranie planu z USOS…" />
      ) : courses.length === 0 ? (
        <div className="empty plain">Nie znaleźliśmy zajęć w Twoim planie.</div>
      ) : (
        <div className="grid-cards">
          {courses.map((course) => (
            <div key={course.course_id} className="card">
              <div className="stack" style={{ gap: 3 }}>
                <span className="card-title">{course.course_name}</span>
                <span className="course-code">{course.course_id}</span>
              </div>
              <div>
                {groupsByType(course).map((group) => {
                  const view = toGroupView(group);
                  return (
                    <div
                      key={view.type}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "110px minmax(0, 1fr)",
                        gap: 12,
                        padding: "10px 0",
                        borderTop: "1px solid var(--line-3)",
                      }}
                    >
                      <span style={{ font: "700 13px var(--font-body)", color: "var(--ink-2)" }}>{view.type}</span>
                      <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                        <span className="mono" style={{ font: "700 13px var(--font-mono)" }}>
                          {view.dayShort} {view.time} · gr. {view.num}
                        </span>
                        <span style={{ font: "500 12px var(--font-body)", color: "var(--muted)" }}>{view.lecturers}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Courses = withPrivateRoute(CoursesPage);
