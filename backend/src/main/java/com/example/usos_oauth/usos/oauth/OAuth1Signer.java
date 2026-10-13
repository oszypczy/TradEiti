package com.example.usos_oauth.usos.oauth;

import org.springframework.http.HttpMethod;
import org.jspecify.annotations.Nullable;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * Minimal OAuth 1.0a request signer (HMAC-SHA1, RFC 5849).
 * Replaces the abandoned spring-social library, which is incompatible with Spring Framework 7.
 */
public class OAuth1Signer {

    private static final String SIGNATURE_METHOD = "HMAC-SHA1";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final String consumerKey;
    private final String consumerSecret;
    private final Clock clock;
    private final Supplier<String> nonceSupplier;

    public OAuth1Signer(String consumerKey, String consumerSecret) {
        this(consumerKey, consumerSecret, Clock.systemUTC(), OAuth1Signer::randomNonce);
    }

    OAuth1Signer(String consumerKey, String consumerSecret, Clock clock, Supplier<String> nonceSupplier) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.clock = clock;
        this.nonceSupplier = nonceSupplier;
    }

    /**
     * Builds the value of the {@code Authorization} header for a request.
     *
     * @param token           access/request token, or {@code null} when fetching a request token
     * @param extraOAuthParams additional {@code oauth_*} parameters, e.g. {@code oauth_callback} or {@code oauth_verifier}
     * @param formParams      {@code application/x-www-form-urlencoded} body parameters (they are part of the signature)
     */
    public String authorizationHeader(HttpMethod method, URI uri, @Nullable OAuthToken token,
                                      Map<String, String> extraOAuthParams,
                                      MultiValueMap<String, String> formParams) {
        Map<String, String> oauthParams = new LinkedHashMap<>();
        oauthParams.put("oauth_consumer_key", consumerKey);
        oauthParams.put("oauth_nonce", nonceSupplier.get());
        oauthParams.put("oauth_signature_method", SIGNATURE_METHOD);
        oauthParams.put("oauth_timestamp", String.valueOf(clock.instant().getEpochSecond()));
        if (token != null) {
            oauthParams.put("oauth_token", token.value());
        }
        oauthParams.put("oauth_version", "1.0");
        oauthParams.putAll(extraOAuthParams);

        String baseString = signatureBaseString(method, uri, oauthParams, formParams);
        oauthParams.put("oauth_signature", sign(baseString, token == null ? "" : token.secret()));

        return "OAuth " + oauthParams.entrySet().stream()
                .map(e -> encode(e.getKey()) + "=\"" + encode(e.getValue()) + "\"")
                .collect(Collectors.joining(", "));
    }

    static String signatureBaseString(HttpMethod method, URI uri, Map<String, String> oauthParams,
                                      MultiValueMap<String, String> formParams) {
        List<String[]> params = new ArrayList<>();
        parseQuery(uri.getRawQuery()).forEach((k, values) -> values.forEach(v -> params.add(new String[]{k, v})));
        formParams.forEach((k, values) -> values.forEach(v -> params.add(new String[]{k, v})));
        oauthParams.forEach((k, v) -> params.add(new String[]{k, v}));

        String normalizedParams = params.stream()
                .map(p -> new String[]{encode(p[0]), encode(p[1])})
                .sorted((a, b) -> a[0].equals(b[0]) ? a[1].compareTo(b[1]) : a[0].compareTo(b[0]))
                .map(p -> p[0] + "=" + p[1])
                .collect(Collectors.joining("&"));

        return method.name().toUpperCase(Locale.ROOT) + "&" + encode(baseUri(uri)) + "&" + encode(normalizedParams);
    }

    String sign(String baseString, String tokenSecret) {
        String key = encode(consumerSecret) + "&" + encode(tokenSecret);
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
            return Base64.getEncoder().encodeToString(mac.doFinal(baseString.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA1 is not available", e);
        }
    }

    private static String baseUri(URI uri) {
        String scheme = uri.getScheme().toLowerCase(Locale.ROOT);
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        int port = uri.getPort();
        boolean defaultPort = port == -1
                || ("http".equals(scheme) && port == 80)
                || ("https".equals(scheme) && port == 443);
        String path = uri.getRawPath() == null || uri.getRawPath().isEmpty() ? "/" : uri.getRawPath();
        return scheme + "://" + host + (defaultPort ? "" : ":" + port) + path;
    }

    static MultiValueMap<String, String> parseQuery(@Nullable String rawQuery) {
        MultiValueMap<String, String> result = new LinkedMultiValueMap<>();
        if (rawQuery == null || rawQuery.isEmpty()) {
            return result;
        }
        UriComponentsBuilder.newInstance().query(rawQuery).build().getQueryParams()
                .forEach((k, values) -> values.forEach(v ->
                        result.add(decode(k), v == null ? "" : decode(v))));
        return result;
    }

    /** RFC 3986 percent-encoding as required by RFC 5849 section 3.6. */
    static String encode(String value) {
        StringBuilder sb = new StringBuilder();
        for (byte b : value.getBytes(StandardCharsets.UTF_8)) {
            char c = (char) (b & 0xFF);
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')
                    || c == '-' || c == '.' || c == '_' || c == '~') {
                sb.append(c);
            } else {
                sb.append('%').append(HexFormat.of().withUpperCase().toHexDigits(b));
            }
        }
        return sb.toString();
    }

    private static String decode(String value) {
        // '+' in a query string means a space in form encoding, which URLDecoder handles
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String randomNonce() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
