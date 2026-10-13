package com.example.usos_oauth.usos.api;

import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.model.usos.LangDict;
import com.example.usos_oauth.usos.model.usos.UsosUser;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Fake USOS used for local development ({@code USOS_MOCK=true}), so the app can be clicked through
 * without USOS consumer keys. Every user is enrolled in the same courses, but in different groups
 * (derived from the user id), so two local accounts can exchange groups with each other.
 */
public class MockUsosApi implements UsosApi {

    private static final DateTimeFormatter USOS_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final Map<Long, String[]> LECTURERS = Map.of(
            1L, new String[]{"Jan", "Kowalski"},
            2L, new String[]{"Anna", "Nowak"},
            3L, new String[]{"Piotr", "Wiśniewski"},
            4L, new String[]{"Maria", "Wójcik"}
    );

    private record ClassType(String pl, String en, int groupCount, int firstGroupNumber) {}

    private record MockCourse(String id, String name, List<ClassType> classTypes) {}

    private static final List<MockCourse> COURSES = List.of(
            new MockCourse("103A-INxxx-ISP-PROI", "Programowanie obiektowe", List.of(
                    new ClassType("Wykład", "Lecture", 1, 1),
                    new ClassType("Laboratorium", "Laboratory", 4, 101),
                    new ClassType("Ćwiczenia", "Classes", 3, 1))),
            new MockCourse("103A-INxxx-ISP-AISDI", "Algorytmy i struktury danych", List.of(
                    new ClassType("Wykład", "Lecture", 1, 1),
                    new ClassType("Laboratorium", "Laboratory", 3, 101))),
            new MockCourse("103A-INxxx-ISP-BD1", "Bazy danych 1", List.of(
                    new ClassType("Projekt", "Project", 3, 1)))
    );

    private final long userId;

    public MockUsosApi(long userId) {
        this.userId = userId;
    }

    @Override
    public UsosUser getUser() {
        UsosUser user = new UsosUser();
        user.setId(String.valueOf(1000 + userId));
        user.setFirstName("Student");
        user.setLastName(String.valueOf(userId));
        return user;
    }

    @Override
    public UsosUser getUser(String id) {
        String[] name = LECTURERS.getOrDefault(Long.parseLong(id), new String[]{"Nieznany", "Prowadzący"});
        UsosUser user = new UsosUser();
        user.setId(id);
        user.setFirstName(name[0]);
        user.setLastName(name[1]);
        return user;
    }

    @Override
    public List<Activity> getCourseActivities(String courseId, String termId, LocalDate start) {
        List<Activity> activities = new ArrayList<>();
        for (int c = 0; c < COURSES.size(); c++) {
            MockCourse course = COURSES.get(c);
            if (!course.id().equals(courseId)) {
                continue;
            }
            for (int t = 0; t < course.classTypes().size(); t++) {
                ClassType type = course.classTypes().get(t);
                for (int g = 0; g < type.groupCount(); g++) {
                    activities.add(activity(course, c, type, t, g, start));
                }
            }
        }
        return activities;
    }

    @Override
    public List<Activity> getUserActivities(LocalDate start) {
        List<Activity> activities = new ArrayList<>();
        for (int c = 0; c < COURSES.size(); c++) {
            MockCourse course = COURSES.get(c);
            for (int t = 0; t < course.classTypes().size(); t++) {
                ClassType type = course.classTypes().get(t);
                int g = (int) ((userId + c + t) % type.groupCount());
                activities.add(activity(course, c, type, t, g, start));
            }
        }
        return activities;
    }

    private static Activity activity(MockCourse course, int courseIndex, ClassType type, int typeIndex,
                                     int groupIndex, LocalDate weekStart) {
        int slot = courseIndex * 7 + typeIndex * 3 + groupIndex;
        LocalDate day = weekStart.plusDays(slot % 5);
        LocalTime startTime = LocalTime.of(8 + 2 * (slot % 6), 15);

        Activity activity = new Activity();
        activity.setCourseId(course.id());
        activity.setCourseName(langDict(course.name(), course.name()));
        activity.setClasstypeName(langDict(type.pl(), type.en()));
        activity.setGroupNumber(type.firstGroupNumber() + groupIndex);
        activity.setStartTime(day.atTime(startTime).format(USOS_DATE_TIME));
        activity.setEndTime(day.atTime(startTime.plusMinutes(105)).format(USOS_DATE_TIME));
        activity.setLecturerIds(List.of((long) (slot % LECTURERS.size()) + 1));
        return activity;
    }

    private static LangDict langDict(String pl, String en) {
        LangDict dict = new LangDict();
        dict.setPl(pl);
        dict.setEn(en);
        return dict;
    }
}
