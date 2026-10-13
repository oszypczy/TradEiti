package com.example.usos_oauth.security.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public final class JwtService {

    static final Duration TOKEN_VALIDITY = Duration.ofHours(10);

    private final SecretKey signingKey;

    public JwtService(@Value("${jwt.key}") String secretKey) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(Map.of(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return generateTokenWithExpiration(extraClaims, userDetails, TOKEN_VALIDITY.toMillis());
    }

    public String generateTokenWithExpiration(UserDetails userDetails, long expirationOffsetMillis) {
        return generateTokenWithExpiration(Map.of(), userDetails, expirationOffsetMillis);
    }

    private String generateTokenWithExpiration(Map<String, Object> extraClaims, UserDetails userDetails,
                                               long expirationOffsetMillis) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationOffsetMillis))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * @throws io.jsonwebtoken.JwtException if the token is malformed, has an invalid signature or is expired
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
