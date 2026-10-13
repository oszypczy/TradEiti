import { axiosBase } from "../config/axiosConfig";
import { GroupDto } from "../models/GroupDto";

export function getCourseGroups(course_id: string) {
  return axiosBase
    .get<GroupDto[]>(`/courses/groups/${encodeURIComponent(course_id)}`)
    .then((response) => response.data);
}
