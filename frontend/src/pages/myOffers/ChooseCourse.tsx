import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { CoursesList } from "../../components/coursesList/CoursesList";
import { MyOffersSteps } from "./MyOffersSteps";
import { CourseDto } from "../../models/Course";
import { getAllCourses } from "../../apiFunctions/getAllCourses";
import {
  removeMultipleValuesFromSessionStorage,
  saveInSessionStorage,
} from "../../common/sessionStorage";
import { GroupDto } from "../../models/GroupDto";
import { FormOffer } from "../../models/form/FormOffer";
import { queryKeys } from "../../config/queryKeys";

export function ChooseCourse() {
  const { data: courses } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: getAllCourses,
  });
  const { reset } = useFormContext<FormOffer>();
  const [, setSearchParams] = useSearchParams();

  const handleBack = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleOnCourseClick = useCallback(
    (course: CourseDto, choosenGroup: GroupDto) => {
      reset({
        course: {
          course_id: course.course_id,
          course_name: course.course_name,
        },
        group: choosenGroup,
        myHour: "",
        opponentHour: "",
      });
      removeMultipleValuesFromSessionStorage(["myHour", "opponentHour"]);
      saveInSessionStorage("course", JSON.stringify(course));
      saveInSessionStorage("group", JSON.stringify(choosenGroup));
      setSearchParams({
        page: MyOffersSteps.MY_OFFERS_ADD,
        course: course.course_id,
        class_type_name: choosenGroup.class_type_name,
        stage: "2",
      });
    },
    [setSearchParams, reset]
  );
  return (
    <>
      <div className="upper">
        <button className="regButton" type="button" onClick={handleBack}>
          Powrót
        </button>
        <h3>Wybierz przedmiot</h3>
        <div></div>
      </div>
      <CoursesList
        courses={courses}
        handleOnClick={handleOnCourseClick}
        inOffers
      />
    </>
  );
}
