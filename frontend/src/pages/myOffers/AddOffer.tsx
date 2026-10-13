import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import "./AddOffer.scss";
import { ChooseCourse } from "./ChooseCourse";
import { ChooseCourseHour } from "./ChooseCourseHour";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { FinalizeOffer } from "./FinalizeOffer";
import { getDefaultOfferFormValues } from "./DefaultOfferFormValues";
import { useEffect } from "react";
import { MyOffersSteps } from "./MyOffersSteps";
import { OfferCreationDto } from "../../models/OfferCreationDto";
import { createOffer } from "../../apiFunctions/createOffer";
import { FormOffer } from "../../models/form/FormOffer";
import { clearSessionStorage } from "../../common/sessionStorage";
import { GroupDto } from "../../models/GroupDto";
import { queryKeys } from "../../config/queryKeys";

function toGroup(group: GroupDto): GroupDto {
  return {
    group_number: group.group_number,
    class_type_name: group.class_type_name,
    weekday: group.weekday,
    start_time: group.start_time,
    end_time: group.end_time,
    lecturers: group.lecturers,
  };
}

export function AddOffer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm<FormOffer>({
    defaultValues: getDefaultOfferFormValues(),
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const stage = searchParams.get("stage");

  const { handleSubmit, getValues } = methods;

  const onSubmit: SubmitHandler<FormOffer> = ({
    course,
    myHour,
    opponentHour,
  }) => {
    if (!course || !myHour || !opponentHour) return;
    const createdOffer: OfferCreationDto = {
      my_course: {
        course_id: course.course_id,
        course_name: course.course_name,
        groups: [toGroup(myHour)],
      },
      wanted_course: {
        course_id: course.course_id,
        course_name: course.course_name,
        groups: [toGroup(opponentHour)],
      },
    };
    createOffer(createdOffer)
      .then(() => {
        alert("Oferta została dodana");
        clearSessionStorage();
        queryClient.invalidateQueries({ queryKey: queryKeys.offers });
        navigate("/myOffers");
      })
      .catch((error) => {
        console.error(error);
        alert("Wystąpił błąd");
        clearSessionStorage();
        navigate("/offers");
      });
  };

  // Don't allow skipping wizard steps (e.g. by reloading on a later stage
  // without the required values).
  useEffect(() => {
    const values = getValues();
    if (stage !== "1" && !values.course) {
      setSearchParams({ page: MyOffersSteps.MY_OFFERS_ADD, stage: "1" });
    } else if (stage === "3" && (!values.myHour || !values.opponentHour)) {
      setSearchParams((params) => {
        params.set("stage", "2");
        return params;
      });
    }
  }, [stage, getValues, setSearchParams]);

  return (
    <FormProvider {...methods}>
      <form className="addOffer" onSubmit={handleSubmit(onSubmit)}>
        {stage === "1" && <ChooseCourse />}
        {stage === "2" && <ChooseCourseHour />}
        {stage === "3" && <FinalizeOffer />}
      </form>
    </FormProvider>
  );
}
