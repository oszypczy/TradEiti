package com.example.usos_oauth.usos.service.connect;

import com.example.usos_oauth.security.service.UserService;
import com.example.usos_oauth.usos.api.UsosApiFactory;
import com.example.usos_oauth.usos.service.usos.UsosService;
import com.example.usos_oauth.usos.service.usos.utils.LecturerDirectory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;

@RequiredArgsConstructor
@Service
public class UsosServiceAuthorizer {

    private final UsosApiFactory usosApiFactory;
    private final UserService userService;
    private final Clock clock;
    private final LecturerDirectory lecturerDirectory;

    public UsosService getUsosService() {
        return new UsosService(usosApiFactory.forUser(userService.getCurrentUser()), clock, lecturerDirectory);
    }
}
