package com.example.usos_oauth.usos.api;

import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.model.usos.UsosUser;

import java.time.LocalDate;
import java.util.List;

/**
 * Subset of the USOS API used by the application, called on behalf of a single user.
 */
public interface UsosApi {

    /** The authorized user; fails with {@code HttpClientErrorException.Unauthorized} if the token is not valid. */
    UsosUser getUser();

    UsosUser getUser(String userId);

    /** All activities of a course edition during the 7 days starting at {@code start}. */
    List<Activity> getCourseActivities(String courseId, String termId, LocalDate start);

    /** The user's activities during the 7 days starting at {@code start}. */
    List<Activity> getUserActivities(LocalDate start);
}
