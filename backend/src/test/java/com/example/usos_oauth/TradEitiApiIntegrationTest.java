package com.example.usos_oauth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end test of the REST API on an in-memory database with the fake USOS ({@code usos.mock=true}).
 */
@SpringBootTest
@AutoConfigureMockMvc
class TradEitiApiIntegrationTest {

    private static final String COURSE = "103A-INxxx-ISP-PROI";
    private static final String LAB = "Laboratorium";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JsonMapper json;

    @Test
    void fullExchangeFlow() throws Exception {
        // Registered one after another, so the fake USOS puts them into three different lab groups
        String alice = register("alice-" + suffix());
        String bob = register("bob-" + suffix());
        String eve = register("eve-" + suffix());

        JsonNode aliceLab = labGroup(alice);
        JsonNode bobLab = labGroup(bob);
        assertThat(aliceLab.get("group_number")).isNotEqualTo(bobLab.get("group_number"));

        String offer = json.writeValueAsString(Map.of(
                "my_course", Map.of("course_id", COURSE, "course_name", "Programowanie obiektowe",
                        "groups", new JsonNode[]{aliceLab}),
                "wanted_course", Map.of("course_id", COURSE, "course_name", "Programowanie obiektowe",
                        "groups", new JsonNode[]{bobLab})));
        long offerId = Long.parseLong(call(post("/api/offers/create").content(offer), alice)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        call(post("/api/offers/create").content(offer), alice).andExpect(status().isConflict());

        // bob attends the wanted group, eve does not
        assertThat(offerIds(call(get("/api/offers/user/PENDING?filter_groups=true"), bob))).contains(offerId);
        assertThat(offerIds(call(get("/api/offers/user/PENDING?filter_groups=true"), eve))).doesNotContain(offerId);
        assertThat(offerIds(call(get("/api/offers/user/PENDING"), eve))).contains(offerId);
        call(patch("/api/offers/send-request/" + offerId), eve).andExpect(status().isForbidden());
        call(patch("/api/offers/send-request/" + offerId), alice).andExpect(status().isForbidden());

        call(patch("/api/offers/send-request/" + offerId), bob).andExpect(status().isOk());
        call(get("/api/offers/received"), bob)
                .andExpect(jsonPath("$[0].offer_id").value(offerId))
                .andExpect(jsonPath("$[0].state").value("REQUEST_SENT"))
                .andExpect(jsonPath("$[0].receiver_username").exists());

        call(patch("/api/offers/accept/" + offerId), bob).andExpect(status().isForbidden());
        call(patch("/api/offers/accept/" + offerId), alice).andExpect(status().isOk());
        call(patch("/api/offers/accept/" + offerId), alice).andExpect(status().isConflict());
        call(delete("/api/offers/delete/" + offerId), alice).andExpect(status().isConflict());
        call(get("/api/offers/user/present/COMPLETED"), bob).andExpect(jsonPath("$[0].offer_id").value(offerId));

        // the participants can chat, nobody else can
        call(post("/api/comments/create").content("{\"offer_id\": " + offerId + ", \"text\": \"Zamieniamy się?\"}"), bob)
                .andExpect(status().isOk());
        call(get("/api/comments/" + offerId), alice)
                .andExpect(jsonPath("$[0].text").value("Zamieniamy się?"))
                .andExpect(jsonPath("$[0].date").isNotEmpty());
        call(get("/api/comments/" + offerId), eve).andExpect(status().isForbidden());
        call(post("/api/comments/create").content("{\"offer_id\": " + offerId + ", \"text\": \"\"}"), bob)
                .andExpect(status().isBadRequest());
    }

    @Test
    void registrationAndLoginValidation() throws Exception {
        String username = "user-" + suffix();
        register(username);
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "secret")))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("  ", "")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "wrong")))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
    }

    @Test
    void changeUsernameReturnsWorkingTokenAndOldTokenStopsWorking() throws Exception {
        String oldToken = register("before-" + suffix());
        String newName = "after-" + suffix();

        String body = call(post("/api/user/change-username").content("{\"username\": \"" + newName + "\"}"), oldToken)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String newToken = json.readTree(body).get("token").asString();

        call(get("/api/user/get-user-info"), newToken).andExpect(jsonPath("$.username").value(newName));
        // the old token refers to a username that no longer exists: 403, not 500
        call(get("/api/user/get-user-info"), oldToken).andExpect(status().isForbidden());
    }

    @Test
    void invalidTokensAndUnknownResources() throws Exception {
        call(get("/api/offers/owned"), "not-a-jwt").andExpect(status().isForbidden());
        mvc.perform(get("/api/offers/owned")).andExpect(status().isForbidden());
        call(get("/api/comments/999999"), register("lost-" + suffix())).andExpect(status().isNotFound());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    private String register(String username) throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, "secret")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asString();
    }

    private JsonNode labGroup(String token) throws Exception {
        String body = call(get("/api/courses/user"), token).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        for (JsonNode course : json.readTree(body)) {
            if (COURSE.equals(course.get("course_id").asString())) {
                for (JsonNode group : course.get("groups")) {
                    if (LAB.equals(group.get("class_type_name").asString())) {
                        return group;
                    }
                }
            }
        }
        throw new AssertionError("No lab group in " + body);
    }

    private List<Long> offerIds(ResultActions result) throws Exception {
        JsonNode offers = json.readTree(result.andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        List<Long> ids = new ArrayList<>();
        offers.forEach(offer -> ids.add(offer.get("offer_id").asLong()));
        return ids;
    }

    private ResultActions call(MockHttpServletRequestBuilder request, String token) throws Exception {
        return mvc.perform(request.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON));
    }

    private String credentials(String username, String password) {
        ObjectNode node = json.createObjectNode();
        node.put("username", username);
        node.put("password", password);
        return node.toString();
    }

    private static String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
