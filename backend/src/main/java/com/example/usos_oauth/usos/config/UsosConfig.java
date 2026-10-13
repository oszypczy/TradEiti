package com.example.usos_oauth.usos.config;

import com.example.usos_oauth.security.model.UsosAuth;
import com.example.usos_oauth.usos.api.MockUsosApi;
import com.example.usos_oauth.usos.api.UsosApiFactory;
import com.example.usos_oauth.usos.api.UsosTemplate;
import com.example.usos_oauth.usos.oauth.HttpUsosOAuthClient;
import com.example.usos_oauth.usos.oauth.MockUsosOAuthClient;
import com.example.usos_oauth.usos.oauth.OAuth1Signer;
import com.example.usos_oauth.usos.oauth.OAuthToken;
import com.example.usos_oauth.usos.oauth.UsosOAuthClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class UsosConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Europe/Warsaw"));
    }

    @Configuration
    @ConditionalOnProperty(name = "usos.mock", havingValue = "false", matchIfMissing = true)
    static class HttpUsos {

        @Bean
        OAuth1Signer usosSigner(@Value("${usos.consumer.key:}") String consumerKey,
                                @Value("${usos.consumer.secret:}") String consumerSecret) {
            if (!StringUtils.hasText(consumerKey) || !StringUtils.hasText(consumerSecret)) {
                throw new IllegalStateException(
                        "USOS consumer key/secret are not set: set CONSUMER_KEY and CONSUMER_SECRET, "
                                + "or USOS_MOCK=true to run with a fake USOS");
            }
            return new OAuth1Signer(consumerKey, consumerSecret);
        }

        @Bean
        UsosOAuthClient usosOAuthClient(OAuth1Signer signer, RestClient.Builder restClientBuilder,
                                        @Value("${usos.base-url}") String baseUrl) {
            return new HttpUsosOAuthClient(signer, restClientBuilder.build(), baseUrl);
        }

        @Bean
        UsosApiFactory usosApiFactory(OAuth1Signer signer, RestClient.Builder restClientBuilder,
                                      @Value("${usos.base-url}") String baseUrl) {
            return user -> {
                UsosAuth auth = user.getUsos_auth();
                OAuthToken token = auth == null
                        ? new OAuthToken("", "")
                        : new OAuthToken(auth.getOauthKey(), auth.getOauthSecret());
                return new UsosTemplate(restClientBuilder, signer, token, baseUrl);
            };
        }
    }

    @Configuration
    @ConditionalOnProperty(name = "usos.mock", havingValue = "true")
    static class FakeUsos {

        private static final Logger log = LoggerFactory.getLogger(FakeUsos.class);

        @Bean
        UsosOAuthClient usosOAuthClient() {
            log.warn("USOS_MOCK=true: using a fake USOS with generated timetables. Never enable this in production.");
            return new MockUsosOAuthClient();
        }

        @Bean
        UsosApiFactory usosApiFactory() {
            return user -> new MockUsosApi(user.getId());
        }
    }
}
