package com.example.usos_oauth.offers.service.utils;

import com.example.usos_oauth.offers.model.dao.Course;
import com.example.usos_oauth.offers.model.dao.Lecturer;
import com.example.usos_oauth.offers.model.dao.Offer;
import com.example.usos_oauth.offers.model.dto.OfferDTO;
import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.usos.model.dto.CourseDTO;
import com.example.usos_oauth.usos.model.dto.GroupDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class OfferDTOMapper {

    private OfferDTOMapper() {}

    public static Course mapToCourse(CourseDTO courseDTO) {
        Course course = new Course();
        GroupDTO groupDTO = courseDTO.getGroups().getFirst();
        course.setUsosCourseId(courseDTO.getCourseId());
        course.setName(courseDTO.getCourseName());
        course.setGroupNumber(groupDTO.getGroupNumber());
        course.setWeekDay(groupDTO.getWeekday());
        course.setStartHour(groupDTO.getStartTime());
        course.setEndHour(groupDTO.getEndTime());
        course.setClassTypeName(groupDTO.getClassTypeName());
        course.setLecturers(Optional.ofNullable(groupDTO.getLecturers()).orElse(List.of()).stream()
                .map(lecturerName -> {
                    Lecturer lecturer = new Lecturer();
                    lecturer.setLecturerName(lecturerName);
                    return lecturer;
                })
                .collect(Collectors.toCollection(ArrayList::new)));
        return course;
    }

    public static CourseDTO mapToCourseDTO(Course course) {
        return CourseDTO.builder()
                .courseId(course.getUsosCourseId())
                .courseName(course.getName())
                .groups(List.of(GroupDTO.builder()
                        .groupNumber(course.getGroupNumber())
                        .classTypeName(course.getClassTypeName())
                        .weekday(course.getWeekDay())
                        .startTime(course.getStartHour())
                        .endTime(course.getEndHour())
                        .lecturers(course.getLecturers().stream()
                                .map(Lecturer::getLecturerName)
                                .toList())
                        .build()))
                .build();
    }

    public static OfferDTO mapToOfferDTO(Offer offer) {
        return OfferDTO.builder()
                .offerId(offer.getOfferId())
                .ownerUsername(offer.getOwner().getUsername())
                .receiverUsername(Optional.ofNullable(offer.getReceiver())
                                  .map(User::getUsername)
                                  .orElse(null))
                .state(offer.getState())
                .myCourse(mapToCourseDTO(offer.getMyCourse()))
                .wantedCourse(mapToCourseDTO(offer.getWantedCourse()))
                .build();
    }
}
