package com.example.usos_oauth.usos.oauth;

/**
 * OAuth 1.0a token (request token or access token) together with its secret.
 */
public record OAuthToken(String value, String secret) {

    @Override
    public String toString() {
        return "OAuthToken[value=" + value + ", secret=***]";
    }
}
