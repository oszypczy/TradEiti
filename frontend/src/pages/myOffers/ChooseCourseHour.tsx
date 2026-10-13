import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { MyOffersSteps } from "./MyOffersSteps";
import "./ChooseCourseHour.scss";
import { CourseHours } from "../../components/hours/CourseHours";
import {
  getJsonFromSessionStorage,
  saveInSessionStorage,
} from "../../common/sessionStorage";
import { getAllCourses } from "../../apiFunctions/getAllCourses";
import { getCourseDateFromCourses } from "./GetCourseDateFromCourses";
import { getCourseGroups } from "../../apiFunctions/getCourseGroups";
import { Loader } from "../../common/loader/Loader";
import { GroupDto } from "../../models/GroupDto";
import { CourseDto } from "../../models/Course";
import { queryKeys } from "../../config/queryKeys";

export function ChooseCourseHour() {
  const { setValue, watch, getValues } = useFormContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: courses } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: getAllCourses,
  });
  const courseId =
    searchParams.get("course") ??
    getJsonFromSessionStorage<CourseDto>("course")?.course_id ??
    "";
  const courseClassType =
    searchParams.get("class_type_name") ??
    getJsonFromSessionStorage<GroupDto>("group")?.class_type_name ??
    "";
  const { data: allCourseGroups } = useQuery({
    queryKey: queryKeys.courseGroups(courseId),
    queryFn: () => getCourseGroups(courseId),
    enabled: courseId !== "",
  });
  const myCourseHour = useMemo(
    () => getCourseDateFromCourses(courses, courseId, courseClassType),
    [courses, courseId, courseClassType]
  );
  const allClassHours = useMemo(
    () =>
      allCourseGroups?.filter(
        (group) => group.class_type_name === courseClassType
      ),
    [allCourseGroups, courseClassType]
  );

  const myHour: GroupDto | undefined = watch("myHour") || undefined;
  const opponentHour: GroupDto | undefined = watch("opponentHour") || undefined;

  const handleBack = useCallback(() => {
    setSearchParams({
      page: MyOffersSteps.MY_OFFERS_ADD,
      stage: "1",
    });
  }, [setSearchParams]);

  const handleChoosingHour = useCallback(
    (date: GroupDto, hourType: string) => {
      setValue(hourType, date);
      saveInSessionStorage(hourType, JSON.stringify(date));
    },
    [setValue]
  );

  const handleSaving = useCallback(() => {
    setSearchParams({
      page: MyOffersSteps.MY_OFFERS_ADD,
      course: courseId,
      class_type_name: courseClassType,
      stage: "3",
    });
  }, [setSearchParams, courseId, courseClassType]);

  useEffect(() => {
    if (getValues("myHour") || !myCourseHour) return;
    handleChoosingHour(myCourseHour[0], "myHour");
  }, [myCourseHour, getValues, handleChoosingHour]);

  return (
    <>
      <div className="upper">
        <button className="regButton" type="button" onClick={handleBack}>
          Powrót
        </button>
        <h3>Wybierz godziny przedmiotu</h3>
        <div></div>
      </div>
      <article>
        {allClassHours && myCourseHour ? (
          <>
            <div>
              <h5>Twoja godzina</h5>
              <div className="hours">
                <CourseHours
                  dates={myCourseHour}
                  selected={myHour}
                  handleChooseDate={handleChoosingHour}
                  hourType="myHour"
                />
              </div>
            </div>
            <div>
              <h5>Godzina oponenta</h5>
              <div className="hours">
                <CourseHours
                  dates={allClassHours}
                  selected={opponentHour}
                  excluded={myHour}
                  handleChooseDate={handleChoosingHour}
                  hourType="opponentHour"
                />
              </div>
            </div>
          </>
        ) : (
          <Loader />
        )}
      </article>
      <div className="lower">
        <button
          type="button"
          className="regButton"
          onClick={handleSaving}
          disabled={!myHour || !opponentHour}
        >
          Zapisz
        </button>
      </div>
    </>
  );
}
