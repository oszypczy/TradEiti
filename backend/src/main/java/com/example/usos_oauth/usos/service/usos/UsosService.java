package com.example.usos_oauth.usos.service.usos;

import com.example.usos_oauth.usos.api.UsosApi;
import com.example.usos_oauth.usos.model.dto.CourseDTO;
import com.example.usos_oauth.usos.model.dto.GroupDTO;
import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.service.usos.exception.UsosAccountNotConnectedException;
import com.example.usos_oauth.usos.service.usos.utils.LecturerDirectory;
import com.example.usos_oauth.usos.service.usos.utils.UsosDTOMapper;
import com.example.usos_oauth.usos.service.usos.utils.UsosDateTimeParser;
import com.example.usos_oauth.usos.service.usos.utils.UsosTermCalculator;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

/**
 * Timetable operations for a single user.
 *
 * <p>The USOS timetable endpoints only return one week of activities. Instead of asking for a hardcoded week
 * (which made the app show an old term), we look for the first week from today on that has any classes
 * (skipping holidays and breaks) and also read the following week, so that bi-weekly groups are not missed.
 */
public class UsosService {

    static final int MAX_WEEKS_AHEAD = 6;
    private static final String LECTURE = "Wykład";

    private final UsosApi usosApi;
    private final Clock clock;
    private final LecturerDirectory lecturerDirectory;

    public UsosService(UsosApi usosApi, Clock clock, LecturerDirectory lecturerDirectory) {
        this.usosApi = usosApi;
        this.clock = clock;
        this.lecturerDirectory = lecturerDirectory;
    }

    public boolean isUserConnected() {
        try {
            usosApi.getUser();
            return true;
        } catch (HttpClientErrorException.Unauthorized e) {
            return false;
        }
    }

    private void assertUserIsConnected() {
        if (!isUserConnected()) {
            throw new UsosAccountNotConnectedException();
        }
    }

    public List<GroupDTO> getCourseGroups(String courseId) {
        assertUserIsConnected();
        String term = UsosTermCalculator.termFor(today());
        List<Activity> activities = fetchTwoWeeks(start -> usosApi.getCourseActivities(courseId, term, start));
        return processActivities(activities).stream()
                .map(UsosDTOMapper::mapToGroupDTO)
                .toList();
    }

    public List<CourseDTO> getCurrentUserCourses() {
        assertUserIsConnected();
        return UsosDTOMapper.mapToCourseDTOList(processActivities(fetchTwoWeeks(usosApi::getUserActivities)));
    }

    public boolean isCurrentUserInGroup(String courseId, String classTypeName, int groupNumber) {
        return getCurrentUserCourses().stream()
                .filter(course -> course.getCourseId().equals(courseId))
                .flatMap(course -> course.getGroups().stream())
                .anyMatch(group -> group.getGroupNumber() == groupNumber
                        && Objects.equals(group.getClassTypeName(), classTypeName));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private List<Activity> fetchTwoWeeks(Function<LocalDate, List<Activity>> fetchWeek) {
        LocalDate monday = today().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        for (int week = 0; week < MAX_WEEKS_AHEAD; week++) {
            LocalDate start = monday.plusWeeks(week);
            List<Activity> activities = fetchWeek.apply(start);
            if (!activities.isEmpty()) {
                List<Activity> result = new ArrayList<>(activities);
                result.addAll(fetchWeek.apply(start.plusWeeks(1)));
                return result;
            }
        }
        return List.of();
    }

    private List<Activity> processActivities(List<Activity> activities) {
        List<Activity> result = deduplicate(removeLectures(activities));
        result.forEach(this::parseDateTime);
        result.forEach(this::updateLecturers);
        return result;
    }

    private static List<Activity> removeLectures(List<Activity> activities) {
        return activities.stream()
                .filter(activity -> activity.getClasstypeName() == null
                        || !LECTURE.equals(activity.getClasstypeName().getPl()))
                .toList();
    }

    /** The same group meets every (or every other) week; keep one entry per group and time slot. */
    private static List<Activity> deduplicate(List<Activity> activities) {
        Map<String, Activity> unique = new LinkedHashMap<>();
        for (Activity activity : activities) {
            String key = String.join("|",
                    activity.getCourseId(),
                    activity.getClasstypeName() == null ? "" : String.valueOf(activity.getClasstypeName().getPl()),
                    String.valueOf(activity.getGroupNumber()),
                    UsosDateTimeParser.parseWeekday(activity.getStartTime()),
                    UsosDateTimeParser.parseHour(activity.getStartTime()),
                    UsosDateTimeParser.parseHour(activity.getEndTime()));
            unique.putIfAbsent(key, activity);
        }
        return new ArrayList<>(unique.values());
    }

    private void parseDateTime(Activity activity) {
        activity.setWeekday(UsosDateTimeParser.parseWeekday(activity.getStartTime()));
        activity.setStartTime(UsosDateTimeParser.parseHour(activity.getStartTime()));
        activity.setEndTime(UsosDateTimeParser.parseHour(activity.getEndTime()));
    }

    private void updateLecturers(Activity activity) {
        if (activity.getLecturerIds() == null) {
            return;
        }
        for (Long lecturerId : activity.getLecturerIds()) {
            activity.getLecturerNames().add(lecturerDirectory.nameOf(lecturerId, usosApi));
        }
    }
}
