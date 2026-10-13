import { GroupDto, isSameGroup } from "../../models/GroupDto";
import { CourseDateComponent } from "../courseDate/CourseDate";
import "./CourseHours.scss";

interface Props {
  dates: GroupDto[] | undefined;
  hourType: string;
  selected: GroupDto | undefined;
  // Entry that cannot be chosen (e.g. your own group in the opponent list)
  excluded?: GroupDto;
  handleChooseDate: (date: GroupDto, hourType: string) => void;
}

export function CourseHours({
  dates,
  hourType,
  selected,
  excluded,
  handleChooseDate,
}: Props) {
  return (
    <>
      {dates?.map((date, index) => (
        <CourseDateComponent
          key={index}
          date={date}
          hourType={hourType}
          selected={isSameGroup(date, selected)}
          disabled={isSameGroup(date, excluded)}
          onSelect={(chosen) => handleChooseDate(chosen, hourType)}
        />
      ))}
    </>
  );
}
