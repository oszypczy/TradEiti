package com.example.usos_oauth.usos.api;

import com.example.usos_oauth.security.model.User;

/**
 * Creates a USOS API client acting on behalf of the given user.
 */
@FunctionalInterface
public interface UsosApiFactory {

    UsosApi forUser(User user);
}
