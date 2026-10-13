import { CourseDto } from "../models/Course";
import { GroupDto } from "../models/GroupDto";

export type DayCode = "PN" | "WT" | "SR" | "CZ" | "PT" | "SB" | "ND";

const DAYS: Record<string, { code: DayCode; short: string }> = {
  Poniedziałek: { code: "PN", short: "PN" },
  Wtorek: { code: "WT", short: "WT" },
  Środa: { code: "SR", short: "ŚR" },
  Czwartek: { code: "CZ", short: "CZ" },
  Piątek: { code: "PT", short: "PT" },
  Sobota: { code: "SB", short: "SB" },
  Niedziela: { code: "ND", short: "ND" },
};

export const DAY_FILTERS: { value: DayCode | ""; label: string }[] = [
  { value: "", label: "Każdy dzień" },
  { value: "PN", label: "Pn" },
  { value: "WT", label: "Wt" },
  { value: "SR", label: "Śr" },
  { value: "CZ", label: "Cz" },
  { value: "PT", label: "Pt" },
];

// Display model of one class meeting, as used throughout the redesigned UI.
export interface GroupView {
  num: number;
  type: string;
  day: DayCode | "";
  dayShort: string;
  dayLong: string;
  time: string;
  lecturers: string;
}

export function toGroupView(group: GroupDto | undefined): GroupView {
  if (!group) {
    return { num: 0, type: "", day: "", dayShort: "–", dayLong: "", time: "", lecturers: "" };
  }
  const day = DAYS[group.weekday];
  return {
    num: group.group_number,
    type: group.class_type_name,
    day: day?.code ?? "",
    dayShort: day?.short ?? group.weekday.slice(0, 2).toUpperCase(),
    dayLong: group.weekday,
    time: `${group.start_time}–${group.end_time}`,
    lecturers: (group.lecturers ?? []).join(", "),
  };
}

// The user's group of the given class type in a course, taken from their USOS timetable.
export function findUserGroup(
  courses: CourseDto[] | undefined,
  courseId: string,
  classType: string
): GroupDto | undefined {
  return courses
    ?.find((course) => course.course_id === courseId)
    ?.groups.find((group) => group.class_type_name === classType);
}

// One entry per class type (a class meeting twice a week is shown once).
export function groupsByType(course: CourseDto): GroupDto[] {
  const seen = new Set<string>();
  return course.groups.filter((group) => {
    if (seen.has(group.class_type_name)) return false;
    seen.add(group.class_type_name);
    return true;
  });
}

// Stable pastel colour pair for a username's avatar initial.
const AVATAR_COLORS: [string, string][] = [
  ["#e8eefc", "#1747c9"],
  ["#e7f6e0", "#1d6a08"],
  ["#fdf0dc", "#8a4b00"],
  ["#f1e8fc", "#6232b8"],
  ["#e3f3f6", "#0d6a7a"],
];

export function avatarColors(name: string): [string, string] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
