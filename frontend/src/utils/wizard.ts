import { GroupDto } from "../models/GroupDto";

// A group can meet more than once a week; each meeting is a separate option.
export function groupKey(group: GroupDto): string {
  return `${group.group_number}|${group.weekday}|${group.start_time}`;
}

// Groups of the given class type the user could switch to (excluding their own group).
export function opponentGroups(groups: GroupDto[] | undefined, classType: string, myGroup: GroupDto | undefined) {
  const seen = new Set<string>();
  return (groups ?? []).filter((group) => {
    if (group.class_type_name !== classType || group.group_number === myGroup?.group_number) return false;
    const key = groupKey(group);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
