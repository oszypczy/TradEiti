package com.example.usos_oauth.usos.oauth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

/**
 * OAuth 1.0a client for the USOS API ({@code /services/oauth/*}).
 */
public class HttpUsosOAuthClient implements UsosOAuthClient {

    /** USOS permission scopes requested from the user; "studies" gives access to the timetable. */
    private static final String SCOPES = "studies";

    private final OAuth1Signer signer;
    private final RestClient restClient;
    private final String baseUrl;

    public HttpUsosOAuthClient(OAuth1Signer signer, RestClient restClient, String baseUrl) {
        this.signer = signer;
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    @Override
    public OAuthToken fetchRequestToken(String callbackUrl) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("scopes", SCOPES);
        return postForToken("/services/oauth/request_token", null, Map.of("oauth_callback", callbackUrl), form);
    }

    @Override
    public String buildAuthorizeUrl(OAuthToken requestToken) {
        return UriComponentsBuilder.fromUriString(baseUrl + "/services/oauth/authorize")
                .queryParam("oauth_token", requestToken.value())
                .encode()
                .toUriString();
    }

    @Override
    public OAuthToken exchangeForAccessToken(OAuthToken requestToken, String verifier) {
        return postForToken("/services/oauth/access_token", requestToken,
                Map.of("oauth_verifier", verifier), new LinkedMultiValueMap<>());
    }

    private OAuthToken postForToken(String path, OAuthToken token, Map<String, String> oauthParams,
                                    MultiValueMap<String, String> form) {
        URI uri = URI.create(baseUrl + path);
        String authorization = signer.authorizationHeader(HttpMethod.POST, uri, token, oauthParams, form);
        String body = restClient.post()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, authorization)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(String.class);
        return parseTokenResponse(body);
    }

    static OAuthToken parseTokenResponse(String body) {
        MultiValueMap<String, String> params = OAuth1Signer.parseQuery(body == null ? "" : body.trim());
        String value = params.getFirst("oauth_token");
        String secret = params.getFirst("oauth_token_secret");
        if (value == null || secret == null) {
            throw new IllegalStateException("USOS returned an invalid OAuth token response");
        }
        return new OAuthToken(value, secret);
    }
}
