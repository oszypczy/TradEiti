package com.example.usos_oauth.usos.controller;

import com.example.usos_oauth.usos.service.connect.UsosConnectService;
import com.example.usos_oauth.usos.service.connect.UsosServiceAuthorizer;
import com.example.usos_oauth.usos.service.usos.UsosService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.Duration;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/usos")
@Tag(name = "Managing connection with USOS")
public class UsosConnectController {

    private final UsosConnectService usosConnectService;
    private final UsosServiceAuthorizer usosServiceAuthorizer;

    private static final Duration STATE_TTL = Duration.ofMinutes(15);

    @Value("${app.url.frontend}")
    private String frontendUrl;

    // Lax: the cookie is sent on the top-level redirect back from USOS, but not on cross-site subrequests
    private static ResponseCookie stateCookie(String value, Duration maxAge, HttpServletRequest request) {
        return ResponseCookie.from(STATE_COOKIE, value)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/api/usos")
                .maxAge(maxAge)
                .build();
    }

    static final String STATE_COOKIE = "usos_oauth_state";

    @GetMapping("/connect")
    public ResponseEntity<String> getAuthorizationUrl(HttpServletRequest request) {
        UsosConnectService.Authorization authorization = usosConnectService.startAuthorization();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, stateCookie(authorization.state(), STATE_TTL, request).toString())
                .body(authorization.url());
    }

    @Hidden
    @GetMapping("/authorize-token")
    public RedirectView getAccessToken(@RequestParam("oauth_token") String oauthToken,
                                       @RequestParam("oauth_verifier") String oauthVerifier,
                                       @RequestParam("user_id") Long userId,
                                       @CookieValue(name = STATE_COOKIE, required = false) String state,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        usosConnectService.verifyUserToken(oauthToken, oauthVerifier, userId, state);
        response.addHeader(HttpHeaders.SET_COOKIE, stateCookie("", Duration.ZERO, request).toString());
        return new RedirectView(frontendUrl, true, true);
    }

    @GetMapping("/check-connection")
    public ResponseEntity<String> checkConnection() {
        UsosService usos = usosServiceAuthorizer.getUsosService();
        if (usos.isUserConnected()) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.PRECONDITION_REQUIRED);
        }
    }
}
