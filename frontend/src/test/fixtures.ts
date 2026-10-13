import { CourseDto } from "../models/Course";
import { GroupDto } from "../models/GroupDto";
import { OfferDto } from "../models/Offer";
import { OfferStatus } from "../models/enums/OfferStatus";

export function group(overrides: Partial<GroupDto> = {}): GroupDto {
  return {
    group_number: 1,
    class_type_name: "Laboratorium",
    weekday: "Poniedziałek",
    start_time: "10:15",
    end_time: "12:00",
    lecturers: ["Jan Kowalski"],
    ...overrides,
  };
}

export function course(overrides: Partial<CourseDto> = {}): CourseDto {
  return {
    course_id: "103A-INxxx-ISP-PAP",
    course_name: "Projekt aplikacyjny",
    groups: [group()],
    ...overrides,
  };
}

export function offer(
  overrides: Partial<OfferDto> & { my?: Partial<GroupDto>; wanted?: Partial<GroupDto> } = {}
): OfferDto {
  const { my, wanted, ...rest } = overrides;
  return {
    offer_id: "1",
    owner_username: "alice",
    receiver_username: "",
    state: OfferStatus.PENDING,
    my_course: course({ groups: [group(my)] }),
    wanted_course: course({ groups: [group({ group_number: 2, ...wanted })] }),
    ...rest,
  };
}
