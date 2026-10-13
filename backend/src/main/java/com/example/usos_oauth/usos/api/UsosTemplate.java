package com.example.usos_oauth.usos.api;

import com.example.usos_oauth.usos.model.usos.Activity;
import com.example.usos_oauth.usos.model.usos.UsosUser;
import com.example.usos_oauth.usos.oauth.OAuth1Signer;
import com.example.usos_oauth.usos.oauth.OAuthToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * USOS API client signing every request with the user's OAuth access token.
 */
public class UsosTemplate implements UsosApi {

    static final String ACTIVITIES_FIELDS =
            "course_name|course_id|group_number|start_time|end_time|lecturer_ids|classtype_name";

    private final RestClient restClient;
    private final String baseUrl;

    public UsosTemplate(RestClient.Builder restClientBuilder, OAuth1Signer signer, OAuthToken accessToken, String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = restClientBuilder.clone()
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().set(HttpHeaders.AUTHORIZATION, signer.authorizationHeader(
                            HttpMethod.valueOf(request.getMethod().name()), request.getURI(), accessToken,
                            Map.of(), new LinkedMultiValueMap<>()));
                    return execution.execute(request, body);
                })
                .build();
    }

    @Override
    public UsosUser getUser() {
        return restClient.get().uri(url("/services/users/user").build().encode().toUri())
                .retrieve().body(UsosUser.class);
    }

    @Override
    public UsosUser getUser(String userId) {
        URI uri = url("/services/users/user")
                .queryParam("user_id", userId)
                .build().encode().toUri();
        return restClient.get().uri(uri).retrieve().body(UsosUser.class);
    }

    @Override
    public List<Activity> getCourseActivities(String courseId, String termId, LocalDate start) {
        URI uri = url("/services/tt/course_edition")
                .queryParam("course_id", courseId)
                .queryParam("term_id", termId)
                .queryParam("start", start.toString())
                .queryParam("fields", ACTIVITIES_FIELDS)
                .build().encode().toUri();
        return fetchActivities(uri);
    }

    @Override
    public List<Activity> getUserActivities(LocalDate start) {
        URI uri = url("/services/tt/student")
                .queryParam("start", start.toString())
                .queryParam("fields", ACTIVITIES_FIELDS)
                .build().encode().toUri();
        return fetchActivities(uri);
    }

    private List<Activity> fetchActivities(URI uri) {
        Activity[] response = restClient.get().uri(uri).retrieve().body(Activity[].class);
        return response == null ? List.of() : List.of(response);
    }

    private UriComponentsBuilder url(String path) {
        return UriComponentsBuilder.fromUriString(baseUrl + path);
    }
}
