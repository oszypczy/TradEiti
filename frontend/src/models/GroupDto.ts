export interface GroupDto {
  group_number: number;
  class_type_name: string;
  start_time: string;
  end_time: string;
  weekday: string;
  lecturers: string[];
}

// Two entries describe the same class meeting (same group, type and time).
export function isSameGroup(
  a: GroupDto | null | undefined,
  b: GroupDto | null | undefined
): boolean {
  if (!a || !b) return false;
  return (
    a.group_number === b.group_number &&
    a.class_type_name === b.class_type_name &&
    a.weekday === b.weekday &&
    a.start_time === b.start_time &&
    a.end_time === b.end_time
  );
}
