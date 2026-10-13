package com.example.usos_oauth.usos.service.usos.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UsosDateTimeParserTest {

    @Test
    void parsesHourAndPolishWeekday() {
        assertThat(UsosDateTimeParser.parseHour("2026-10-14 08:15:00")).isEqualTo("08:15");
        assertThat(UsosDateTimeParser.parseWeekday("2026-10-14 08:15:00")).isEqualTo("Środa");
        assertThat(UsosDateTimeParser.parseWeekday("2026-10-18 12:00:00")).isEqualTo("Niedziela");
    }
}
