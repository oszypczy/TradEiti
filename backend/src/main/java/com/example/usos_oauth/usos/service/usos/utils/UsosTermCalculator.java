package com.example.usos_oauth.usos.service.usos.utils;

import java.time.LocalDate;

/**
 * Maps a date to the USOS term id used at Warsaw University of Technology,
 * e.g. {@code 2025Z} (winter term 2025/26) or {@code 2026L} (summer term 2025/26).
 */
public final class UsosTermCalculator {

    private UsosTermCalculator() {}

    /**
     * January belongs to the winter term that started in the previous year, February–July to the summer term
     * and August–December to the upcoming/ongoing winter term (so offers can be prepared before the term starts).
     */
    public static String termFor(LocalDate date) {
        int year = date.getYear();
        int month = date.getMonthValue();
        if (month == 1) {
            return (year - 1) + "Z";
        }
        if (month <= 7) {
            return year + "L";
        }
        return year + "Z";
    }
}
