package com.example.usos_oauth.usos.service.usos.utils;

import com.example.usos_oauth.usos.api.UsosApi;
import com.example.usos_oauth.usos.model.usos.UsosUser;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Application-wide cache of lecturer names, so each timetable request does not issue one USOS call per lecturer.
 */
@Component
public class LecturerDirectory {

    private static final int MAX_ENTRIES = 10_000;

    private final Map<Long, String> names = new ConcurrentHashMap<>();

    public String nameOf(long lecturerId, UsosApi usosApi) {
        String cached = names.get(lecturerId);
        if (cached != null) {
            return cached;
        }
        UsosUser user = usosApi.getUser(String.valueOf(lecturerId));
        String name = user.getFirstName() + " " + user.getLastName();
        if (names.size() < MAX_ENTRIES) {
            names.put(lecturerId, name);
        }
        return name;
    }
}
