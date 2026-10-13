package com.example.usos_oauth.usos.service.usos.utils;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class UsosTermCalculatorTest {

    @ParameterizedTest
    @CsvSource({
            "2026-01-01, 2025Z",
            // the last day of a month used to return "Invalid date"
            "2026-01-31, 2025Z",
            "2026-02-01, 2026L",
            "2026-07-31, 2026L",
            "2026-08-01, 2026Z",
            "2026-10-13, 2026Z",
            "2026-12-31, 2026Z",
    })
    void termFor(LocalDate date, String expectedTerm) {
        assertThat(UsosTermCalculator.termFor(date)).isEqualTo(expectedTerm);
    }
}
