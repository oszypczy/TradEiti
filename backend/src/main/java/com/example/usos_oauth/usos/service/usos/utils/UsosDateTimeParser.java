package com.example.usos_oauth.usos.service.usos.utils;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public final class UsosDateTimeParser {

    private static final Map<DayOfWeek, String> WEEKDAYS = Map.of(
            DayOfWeek.MONDAY, "Poniedziałek",
            DayOfWeek.TUESDAY, "Wtorek",
            DayOfWeek.WEDNESDAY, "Środa",
            DayOfWeek.THURSDAY, "Czwartek",
            DayOfWeek.FRIDAY, "Piątek",
            DayOfWeek.SATURDAY, "Sobota",
            DayOfWeek.SUNDAY, "Niedziela"
    );
    private static final DateTimeFormatter INPUT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter OUTPUT_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private UsosDateTimeParser() {}

    public static String parseHour(String time) {
        return LocalDateTime.parse(time, INPUT_FORMAT).format(OUTPUT_FORMAT);
    }

    public static String parseWeekday(String time) {
        return WEEKDAYS.get(LocalDateTime.parse(time, INPUT_FORMAT).getDayOfWeek());
    }
}
