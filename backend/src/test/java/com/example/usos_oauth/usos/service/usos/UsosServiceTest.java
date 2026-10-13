package com.example.usos_oauth.usos.service.usos;

import com.example.usos_oauth.usos.api.UsosApi;
import com.example.usos_oauth.usos.model.dto.CourseDTO;
import com.example.usos_oauth.usos.model.dto.GroupDTO;
import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.model.usos.LangDict;
import com.example.usos_oauth.usos.model.usos.UsosUser;
import com.example.usos_oauth.usos.service.usos.exception.UsosAccountNotConnectedException;
import com.example.usos_oauth.usos.service.usos.utils.LecturerDirectory;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UsosServiceTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");
    /** Tuesday; the week starts on Monday 2026-12-21 (Christmas break). */
    private static final LocalDate TODAY = LocalDate.of(2026, 12, 22);

    private final FakeUsosApi api = new FakeUsosApi();
    private final UsosService service = new UsosService(api,
            Clock.fixed(TODAY.atStartOfDay(WARSAW).toInstant(), WARSAW), new LecturerDirectory());

    @Test
    void getCurrentUserCourses_skipsWeeksWithoutClasses() {
        // No classes during the Christmas break, classes again from 2027-01-04
        LocalDate firstWeekWithClasses = LocalDate.of(2027, 1, 4);
        api.userWeeks.put(firstWeekWithClasses, List.of(
                activity("PROI", "Laboratorium", 101, "2027-01-05 08:15:00", 1L)));

        List<CourseDTO> courses = service.getCurrentUserCourses();

        assertThat(courses).singleElement().satisfies(course -> {
            assertThat(course.getCourseId()).isEqualTo("PROI");
            assertThat(course.getGroups()).singleElement().satisfies(group -> {
                assertThat(group.getGroupNumber()).isEqualTo(101);
                assertThat(group.getWeekday()).isEqualTo("Wtorek");
                assertThat(group.getStartTime()).isEqualTo("08:15");
                assertThat(group.getLecturers()).containsExactly("Lecturer 1");
            });
        });
        assertThat(api.requestedUserWeeks)
                .startsWith(LocalDate.of(2026, 12, 21), LocalDate.of(2026, 12, 28), firstWeekWithClasses)
                .contains(firstWeekWithClasses.plusWeeks(1));
    }

    @Test
    void getCurrentUserCourses_mergesTwoWeeksSoBiweeklyGroupsAreNotMissedAndDeduplicates() {
        LocalDate monday = LocalDate.of(2026, 12, 21);
        api.userWeeks.put(monday, List.of(
                activity("PROI", "Ćwiczenia", 1, "2026-12-21 10:15:00", 1L),
                activity("PROI", "Wykład", 1, "2026-12-21 12:15:00", 2L)));
        api.userWeeks.put(monday.plusWeeks(1), List.of(
                activity("PROI", "Ćwiczenia", 1, "2026-12-28 10:15:00", 1L),
                activity("PROI", "Laboratorium", 103, "2026-12-30 14:15:00", 3L)));

        List<GroupDTO> groups = service.getCurrentUserCourses().getFirst().getGroups();

        assertThat(groups).extracting(GroupDTO::getClassTypeName)
                .containsExactly("Ćwiczenia", "Laboratorium"); // lecture removed, duplicate merged
    }

    @Test
    void lecturerNamesAreCachedAcrossCalls() {
        api.userWeeks.put(LocalDate.of(2026, 12, 21), List.of(
                activity("PROI", "Laboratorium", 101, "2026-12-22 08:15:00", 1L)));

        service.getCurrentUserCourses();
        service.getCurrentUserCourses();

        assertThat(api.lecturerLookups).isEqualTo(1);
    }

    @Test
    void isCurrentUserInGroup_requiresMatchingClassType() {
        api.userWeeks.put(LocalDate.of(2026, 12, 21), List.of(
                activity("PROI", "Ćwiczenia", 1, "2026-12-22 08:15:00", 1L)));

        assertThat(service.isCurrentUserInGroup("PROI", "Ćwiczenia", 1)).isTrue();
        assertThat(service.isCurrentUserInGroup("PROI", "Laboratorium", 1)).isFalse();
        assertThat(service.isCurrentUserInGroup("AISDI", "Ćwiczenia", 1)).isFalse();
    }

    @Test
    void getCourseGroups_usesTermOfToday() {
        api.courseWeeks.put(LocalDate.of(2026, 12, 21), List.of(
                activity("PROI", "Laboratorium", 101, "2026-12-22 08:15:00", 1L),
                activity("PROI", "Laboratorium", 102, "2026-12-23 08:15:00", 1L)));

        assertThat(service.getCourseGroups("PROI")).extracting(GroupDTO::getGroupNumber).containsExactly(101, 102);
        assertThat(api.requestedTerms).containsOnly("2026Z");
    }

    @Test
    void notConnectedUserGetsDedicatedException() {
        api.connected = false;

        assertThat(service.isUserConnected()).isFalse();
        assertThatThrownBy(service::getCurrentUserCourses).isInstanceOf(UsosAccountNotConnectedException.class);
    }

    private static Activity activity(String courseId, String classType, int group, String start, long lecturerId) {
        Activity activity = new Activity();
        activity.setCourseId(courseId);
        activity.setCourseName(langDict(courseId));
        activity.setClasstypeName(langDict(classType));
        activity.setGroupNumber(group);
        activity.setStartTime(start);
        activity.setEndTime(start.substring(0, 11) + "23:59:00");
        activity.setLecturerIds(List.of(lecturerId));
        return activity;
    }

    private static LangDict langDict(String pl) {
        LangDict dict = new LangDict();
        dict.setPl(pl);
        dict.setEn(pl);
        return dict;
    }

    /** Returns fresh activity copies per call, as the real API would. */
    private static final class FakeUsosApi implements UsosApi {
        final Map<LocalDate, List<Activity>> userWeeks = new HashMap<>();
        final Map<LocalDate, List<Activity>> courseWeeks = new HashMap<>();
        final List<LocalDate> requestedUserWeeks = new ArrayList<>();
        final List<String> requestedTerms = new ArrayList<>();
        int lecturerLookups;
        boolean connected = true;

        @Override
        public UsosUser getUser() {
            if (!connected) {
                throw HttpClientErrorException.create(HttpStatus.UNAUTHORIZED, "Unauthorized", null, new byte[0],
                        StandardCharsets.UTF_8);
            }
            return new UsosUser();
        }

        @Override
        public UsosUser getUser(String userId) {
            lecturerLookups++;
            UsosUser user = new UsosUser();
            user.setFirstName("Lecturer");
            user.setLastName(userId);
            return user;
        }

        @Override
        public List<Activity> getCourseActivities(String courseId, String termId, LocalDate start) {
            requestedTerms.add(termId);
            return copy(courseWeeks.getOrDefault(start, List.of()));
        }

        @Override
        public List<Activity> getUserActivities(LocalDate start) {
            requestedUserWeeks.add(start);
            return copy(userWeeks.getOrDefault(start, List.of()));
        }

        private static List<Activity> copy(List<Activity> activities) {
            return activities.stream().map(a -> {
                Activity copy = activity(a.getCourseId(), a.getClasstypeName().getPl(), a.getGroupNumber(),
                        a.getStartTime(), a.getLecturerIds().getFirst());
                copy.setEndTime(a.getEndTime());
                return copy;
            }).toList();
        }
    }
}
