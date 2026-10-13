package com.example.usos_oauth.usos.oauth;

/**
 * The three-legged OAuth 1.0a flow against USOS.
 */
public interface UsosOAuthClient {

    OAuthToken fetchRequestToken(String callbackUrl);

    String buildAuthorizeUrl(OAuthToken requestToken);

    OAuthToken exchangeForAccessToken(OAuthToken requestToken, String verifier);
}
