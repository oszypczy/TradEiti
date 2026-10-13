import { useFormContext } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { MyOffersSteps } from "./MyOffersSteps";
import { FormOffer } from "../../models/form/FormOffer";
import { GroupDto } from "../../models/GroupDto";
import "./FinalizeOffer.scss";

function HourSummary({ label, hour }: { label: string; hour: GroupDto }) {
  return (
    <li>
      <b>{label}</b>
      <br />
      {hour.weekday}
      <br />
      {hour.start_time} - {hour.end_time}
      {hour.lecturers.map((lecturer) => (
        <span key={lecturer}>
          <br />
          {lecturer}
        </span>
      ))}
    </li>
  );
}

export function FinalizeOffer() {
  const { getValues } = useFormContext<FormOffer>();
  const [, setSearchParams] = useSearchParams();
  const { course, group, myHour, opponentHour } = getValues();

  const handleBack = () => {
    setSearchParams({
      page: MyOffersSteps.MY_OFFERS_ADD,
      course: course ? course.course_id : "",
      class_type_name: group ? group.class_type_name : "",
      stage: "2",
    });
  };

  return (
    <>
      <div className="upper">
        <button className="regButton" type="button" onClick={handleBack}>
          Powrót
        </button>
        <h3>Podsumowanie oferty</h3>
        <div></div>
      </div>
      {course && myHour && opponentHour && (
        <ul className="offerDataList">
          <li>
            ID przedmiotu: <b>{course.course_id}</b>
          </li>
          <li>
            Nazwa przedmiotu: <b>{course.course_name}</b>
          </li>
          <div className="exchangeHours">
            <HourSummary label="Oddajesz:" hour={myHour} />
            <div className="arrowAnim"></div>
            <HourSummary label="Otrzymasz:" hour={opponentHour} />
          </div>
        </ul>
      )}
      <div className="lower">
        <button className="regButton" type="submit">
          Stwórz ofertę
        </button>
      </div>
    </>
  );
}
