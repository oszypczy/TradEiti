import { CourseDto } from "../Course";
import { GroupDto } from "../GroupDto";

// Values of the "add offer" wizard form. Empty string = not chosen yet.
export interface FormOffer {
  course: Pick<CourseDto, "course_id" | "course_name"> | "";
  group: GroupDto | "";
  myHour: GroupDto | "";
  opponentHour: GroupDto | "";
}
