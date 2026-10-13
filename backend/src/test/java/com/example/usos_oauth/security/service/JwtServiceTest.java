package com.example.usos_oauth.security.service;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService("123123123123123123138274fgupw0bt7v32yt47n320572365t72312312312312312312312");

    @Test
    void generateToken_ValidUserDetails_ReturnsToken() {
        // Given
        UserDetails userDetails = User.withUsername("testUser").password("password").roles("USER").build();

        // When
        String token = jwtService.generateToken(userDetails);

        // Then
        Assertions.assertNotNull(token);
    }

    @Test
    void generateToken_WithExtraClaims_ReturnsTokenWithClaims() {
        // Given
        UserDetails userDetails = User.withUsername("testUser").password("password").roles("USER").build();
        Map<String, Object> extraClaims = Map.of("customClaim", "customValue");

        // When
        String token = jwtService.generateToken(extraClaims, userDetails);

        // Then
        Assertions.assertEquals("customValue", jwtService.extractClaim(token, claims -> claims.get("customClaim")));

    }

    @Test
    void extractUsername_ValidToken_ReturnsUsername() {
        // Given
        String token = jwtService.generateToken(User.withUsername("testUser").password("password").roles("USER").build());

        // When
        String username = jwtService.extractUsername(token);

        // Then
        Assertions.assertEquals("testUser", username);
    }

    @Test
    void isTokenValid_ValidTokenAndUserDetails_ReturnsTrue() {
        // Given
        UserDetails userDetails = User.withUsername("testUser").password("password").roles("USER").build();
        String token = jwtService.generateToken(userDetails);

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        Assertions.assertTrue(isValid);
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        // Given
        UserDetails userDetails = User.withUsername("testUser").password("password").roles("USER").build();
        String expiredToken = jwtService.generateTokenWithExpiration(userDetails, -1000L);

        // When / Then
        Assertions.assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(expiredToken, userDetails));
    }

    @Test
    void isTokenValid_DifferentUser_ReturnsFalse() {
        String token = jwtService.generateToken(User.withUsername("testUser").password("password").roles("USER").build());
        UserDetails other = User.withUsername("otherUser").password("password").roles("USER").build();

        Assertions.assertFalse(jwtService.isTokenValid(token, other));
    }

    @Test
    void extractUsername_TokenSignedWithAnotherKey_Throws() {
        JwtService otherService = new JwtService("b3RoZXIta2V5LXRoYXQtaXMtbG9uZy1lbm91Z2gtZm9yLWhzMjU2LXNpZ25hdHVyZXM=");
        String foreignToken = otherService.generateToken(User.withUsername("testUser").password("p").roles("USER").build());

        Assertions.assertThrows(SignatureException.class, () -> jwtService.extractUsername(foreignToken));
    }
}