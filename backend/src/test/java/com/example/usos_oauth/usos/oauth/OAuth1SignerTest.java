package com.example.usos_oauth.usos.oauth;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class OAuth1SignerTest {

    @Test
    void signatureBaseString_matchesRfc5849Example() {
        // RFC 5849, section 3.4.1.1
        URI uri = URI.create("http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b");
        Map<String, String> oauthParams = new LinkedHashMap<>();
        oauthParams.put("oauth_consumer_key", "9djdj82h48djs9d2");
        oauthParams.put("oauth_token", "kkk9d7dh3k39sjv7");
        oauthParams.put("oauth_signature_method", "HMAC-SHA1");
        oauthParams.put("oauth_timestamp", "137131201");
        oauthParams.put("oauth_nonce", "7d8f3e4a");
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("c2", "");
        form.add("a3", "2 q");

        String baseString = OAuth1Signer.signatureBaseString(HttpMethod.POST, uri, oauthParams, form);

        assertThat(baseString).isEqualTo("POST&http%3A%2F%2Fexample.com%2Frequest&a2%3Dr%2520b%26a3%3D2%2520q"
                + "%26a3%3Da%26b5%3D%253D%25253D%26c%2540%3D%26c2%3D%26oauth_consumer_key%3D9djdj82h48djs9d2"
                + "%26oauth_nonce%3D7d8f3e4a%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D137131201"
                + "%26oauth_token%3Dkkk9d7dh3k39sjv7");
    }

    @Test
    void authorizationHeader_matchesKnownSignature() {
        // Well-known example from Twitter's "Creating a signature" documentation
        Clock clock = Clock.fixed(Instant.ofEpochSecond(1318622958), ZoneOffset.UTC);
        OAuth1Signer signer = new OAuth1Signer("xvz1evFS4wEEPTGEFPHBog",
                "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw", clock,
                () -> "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg");
        OAuthToken token = new OAuthToken("370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
                "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE");
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("status", "Hello Ladies + Gentlemen, a signed OAuth request!");

        String header = signer.authorizationHeader(HttpMethod.POST,
                URI.create("https://api.twitter.com/1.1/statuses/update.json?include_entities=true"),
                token, Map.of(), form);

        assertThat(header)
                .startsWith("OAuth ")
                .contains("oauth_signature=\"hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D\"")
                .contains("oauth_token=\"370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb\"")
                .contains("oauth_version=\"1.0\"");
    }

    @Test
    void authorizationHeader_withoutToken_includesExtraParamsAndNoToken() {
        OAuth1Signer signer = new OAuth1Signer("key", "secret");

        String header = signer.authorizationHeader(HttpMethod.POST, URI.create("https://usos.example/oauth"),
                null, Map.of("oauth_callback", "http://localhost/cb?user_id=1"), new LinkedMultiValueMap<>());

        assertThat(header)
                .contains("oauth_callback=\"http%3A%2F%2Flocalhost%2Fcb%3Fuser_id%3D1\"")
                .doesNotContain("oauth_token=");
    }

    @Test
    void signatureBaseString_dropsDefaultPortAndLowercasesHost() {
        String baseString = OAuth1Signer.signatureBaseString(HttpMethod.GET,
                URI.create("HTTPS://Apps.USOS.example:443/services/tt/student?fields=a%7Cb"),
                Map.of(), new LinkedMultiValueMap<>());

        assertThat(baseString).isEqualTo("GET&https%3A%2F%2Fapps.usos.example%2Fservices%2Ftt%2Fstudent&fields%3Da%257Cb");
    }

    @Test
    void encode_usesRfc3986UnreservedCharacters() {
        assertThat(OAuth1Signer.encode("a b+c~-._*ł")).isEqualTo("a%20b%2Bc~-._%2A%C5%82");
    }
}
