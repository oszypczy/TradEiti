import { CourseDateData } from "../../models/CourseDate";
import { CourseDateComponent } from "../courseDate/CourseDate";
import "./CourseHours.scss";

interface Props {
  dates: CourseDateData[];
  handleChooseDate?: (date: CourseDateData, hourType: string) => void;
  hourType?: string;
  choosenHour?: CourseDateData;
}

export function CourseHours({
  dates,
  handleChooseDate = () => {},
  hourType,
  choosenHour,
}: Props) {
  return (
    <>
      {dates &&
        dates.map((date, index) => (
          <CourseDateComponent
            key={index}
            date={date}
            handleChooseDate={handleChooseDate}
            hourType={hourType}
            choosenHour={choosenHour}
          />
        ))}
    </>
  );
}
