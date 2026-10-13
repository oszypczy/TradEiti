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
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@RequiredArgsConstructor
@Service
public class UsosConnectService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UsosOAuthClient usosOAuthClient;
    private final UserService userService;

    @Value("${app.url.backend}")
    private String backendUrl;

    /**
     * @param url   the USOS page where the user grants access
     * @param state secret to be stored in the browser (cookie); the callback must present it
     */
    public record Authorization(String url, String state) {}

    public Authorization startAuthorization() {
        User currentUser = userService.getCurrentUser();
        OAuthToken requestToken = usosOAuthClient.fetchRequestToken(getRedirectUrl(currentUser));
        String state = randomState();
        userService.updateUserToken(currentUser.getId(), requestToken, sha256(state));
        return new Authorization(usosOAuthClient.buildAuthorizeUrl(requestToken), state);
    }

    /**
     * Handles the USOS callback. The endpoint is public, so it must be called by the browser that started the
     * authorization (it holds the state cookie) and with the request token stored for that user. Otherwise anyone
     * could link their USOS account to someone else's account, or get a victim's USOS linked to theirs.
     */
    public void verifyUserToken(String oauthToken, String oauthVerifier, Long userId, String state) {
        String expectedStateHash = userService.getOauthStateHash(userId);
        if (state == null || expectedStateHash == null || !constantTimeEquals(expectedStateHash, sha256(state))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "USOS authorization was started in another browser");
        }
        OAuthToken requestToken = userService.getUserToken(userId);
        if (!constantTimeEquals(requestToken.value(), oauthToken)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "OAuth token does not match");
        }
        OAuthToken accessToken = usosOAuthClient.exchangeForAccessToken(requestToken, oauthVerifier);
        userService.updateUserToken(userId, accessToken, null);
    }

    private String getRedirectUrl(User currentUser) {
        return backendUrl + "/api/usos/authorize-token?user_id=" + currentUser.getId();
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private static String randomState() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
