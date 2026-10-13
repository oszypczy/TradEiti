package com.example.usos_oauth.usos.api;

import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.oauth.OAuth1Signer;
import com.example.usos_oauth.usos.oauth.OAuthToken;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.hamcrest.Matchers.startsWith;

class UsosTemplateTest {

    private static final String BASE_URL = "https://usos.example";

    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final UsosTemplate usos = new UsosTemplate(builder, new OAuth1Signer("key", "secret"),
            new OAuthToken("access", "accessSecret"), BASE_URL);

    @Test
    void getUserActivities_requestsTheGivenWeekAndParsesSnakeCaseJson() {
        // Regression: the week used to be hardcoded to 2023-12-04, so the app always showed an old term
        server.expect(requestTo(startsWith(BASE_URL + "/services/tt/student")))
                .andExpect(queryParam("start", "2026-10-12"))
                .andExpect(queryParam("fields", "course_name%7Ccourse_id%7Cgroup_number%7Cstart_time%7Cend_time"
                        + "%7Clecturer_ids%7Cclasstype_name"))
                .andExpect(header("Authorization", allOf(startsWith("OAuth "),
                        containsString("oauth_token=\"access\""))))
                .andRespond(withSuccess("""
                        [{"course_id": "PROI", "group_number": 101,
                          "start_time": "2026-10-12 08:15:00", "end_time": "2026-10-12 10:00:00",
                          "course_name": {"pl": "Programowanie", "en": "Programming"},
                          "classtype_name": {"pl": "Laboratorium", "en": "Laboratory"},
                          "lecturer_ids": [7]}]
                        """, MediaType.APPLICATION_JSON));

        List<Activity> activities = usos.getUserActivities(LocalDate.of(2026, 10, 12));

        assertThat(activities).singleElement().satisfies(activity -> {
            assertThat(activity.getCourseId()).isEqualTo("PROI");
            assertThat(activity.getGroupNumber()).isEqualTo(101);
            assertThat(activity.getCourseName().getPl()).isEqualTo("Programowanie");
            assertThat(activity.getClasstypeName().getPl()).isEqualTo("Laboratorium");
            assertThat(activity.getLecturerIds()).containsExactly(7L);
        });
        server.verify();
    }

    @Test
    void getCourseActivities_passesCourseTermAndWeek() {
        server.expect(requestTo(startsWith(BASE_URL + "/services/tt/course_edition")))
                .andExpect(queryParam("course_id", "PROI"))
                .andExpect(queryParam("term_id", "2026Z"))
                .andExpect(queryParam("start", "2026-10-12"))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertThat(usos.getCourseActivities("PROI", "2026Z", LocalDate.of(2026, 10, 12))).isEmpty();
        server.verify();
    }
}
