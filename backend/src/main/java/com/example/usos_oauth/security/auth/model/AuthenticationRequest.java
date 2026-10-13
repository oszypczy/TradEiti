package com.example.usos_oauth.security.auth.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) class representing a user's authentication request.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {

        /**
         * The username associated with the authentication request.
         */
        @NotBlank
        @Size(max = 64)
        private String username;

        /**
         * The password associated with the authentication request.
         */
        @NotBlank
        @Size(max = 72)
        private String password;
}
