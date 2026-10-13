package com.example.usos_oauth.usos.oauth;

import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fake OAuth flow for {@code USOS_MOCK=true}: "authorizing" immediately redirects back to the callback.
 */
public class MockUsosOAuthClient implements UsosOAuthClient {

    private final Map<String, String> callbacks = new ConcurrentHashMap<>();

    @Override
    public OAuthToken fetchRequestToken(String callbackUrl) {
        OAuthToken token = new OAuthToken("mock-request-" + UUID.randomUUID(), "mock-secret");
        callbacks.put(token.value(), callbackUrl);
        return token;
    }

    @Override
    public String buildAuthorizeUrl(OAuthToken requestToken) {
        return UriComponentsBuilder.fromUriString(callbacks.remove(requestToken.value()))
                .queryParam("oauth_token", requestToken.value())
                .queryParam("oauth_verifier", "mock-verifier")
                .toUriString();
    }

    @Override
    public OAuthToken exchangeForAccessToken(OAuthToken requestToken, String verifier) {
        return new OAuthToken("mock-access-" + UUID.randomUUID(), "mock-secret");
    }
}
