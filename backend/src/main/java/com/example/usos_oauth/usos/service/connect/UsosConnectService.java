package com.example.usos_oauth.usos.service.connect;

import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.security.service.UserService;
import com.example.usos_oauth.usos.oauth.OAuthToken;
import com.example.usos_oauth.usos.oauth.UsosOAuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RequiredArgsConstructor
@Service
public class UsosConnectService {

    private final UsosOAuthClient usosOAuthClient;
    private final UserService userService;

    @Value("${app.url.backend}")
    private String backendUrl;

    public String getAuthorizationUrl() {
        User currentUser = userService.getCurrentUser();
        OAuthToken requestToken = usosOAuthClient.fetchRequestToken(getRedirectUrl(currentUser));
        userService.updateUserToken(currentUser.getId(), requestToken);
        return usosOAuthClient.buildAuthorizeUrl(requestToken);
    }

    /**
     * Handles the USOS callback. The callback endpoint is public, so the request token echoed by USOS must match
     * the one stored for the user, otherwise anyone could trigger the exchange for an arbitrary user id.
     */
    public void verifyUserToken(String oauthToken, String oauthVerifier, Long userId) {
        OAuthToken requestToken = userService.getUserToken(userId);
        if (!MessageDigest.isEqual(requestToken.value().getBytes(StandardCharsets.UTF_8),
                oauthToken.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "OAuth token does not match");
        }
        OAuthToken accessToken = usosOAuthClient.exchangeForAccessToken(requestToken, oauthVerifier);
        userService.updateUserToken(userId, accessToken);
    }

    private String getRedirectUrl(User currentUser) {
        return backendUrl + "/api/usos/authorize-token?user_id=" + currentUser.getId();
    }
}
