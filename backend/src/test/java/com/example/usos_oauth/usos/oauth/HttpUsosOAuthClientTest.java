package com.example.usos_oauth.usos.oauth;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class HttpUsosOAuthClientTest {

    private static final String BASE_URL = "https://usos.example";

    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final HttpUsosOAuthClient client =
            new HttpUsosOAuthClient(new OAuth1Signer("key", "secret"), builder.build(), BASE_URL);

    @Test
    void fetchRequestToken_sendsSignedRequestWithCallbackAndScopes() {
        server.expect(requestTo(BASE_URL + "/services/oauth/request_token"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", allOf(startsWith("OAuth "),
                        containsString("oauth_callback=\"http%3A%2F%2Fbackend%2Fcb\""),
                        containsString("oauth_consumer_key=\"key\""))))
                .andExpect(content().string("scopes=studies"))
                .andRespond(withSuccess("oauth_token=req&oauth_token_secret=reqSecret&oauth_callback_confirmed=true",
                        MediaType.TEXT_PLAIN));

        OAuthToken token = client.fetchRequestToken("http://backend/cb");

        assertThat(token).isEqualTo(new OAuthToken("req", "reqSecret"));
        server.verify();
    }

    @Test
    void exchangeForAccessToken_sendsVerifierAndRequestToken() {
        server.expect(requestTo(BASE_URL + "/services/oauth/access_token"))
                .andExpect(header("Authorization", allOf(
                        containsString("oauth_verifier=\"12345\""),
                        containsString("oauth_token=\"req\""))))
                .andRespond(withSuccess("oauth_token=acc&oauth_token_secret=accSecret", MediaType.TEXT_PLAIN));

        OAuthToken token = client.exchangeForAccessToken(new OAuthToken("req", "reqSecret"), "12345");

        assertThat(token).isEqualTo(new OAuthToken("acc", "accSecret"));
        server.verify();
    }

    @Test
    void buildAuthorizeUrl_containsRequestToken() {
        assertThat(client.buildAuthorizeUrl(new OAuthToken("abc", "s")))
                .isEqualTo(BASE_URL + "/services/oauth/authorize?oauth_token=abc");
    }

    @Test
    void parseTokenResponse_rejectsResponseWithoutToken() {
        assertThatThrownBy(() -> HttpUsosOAuthClient.parseTokenResponse("error=bad"))
                .isInstanceOf(IllegalStateException.class);
    }
}
