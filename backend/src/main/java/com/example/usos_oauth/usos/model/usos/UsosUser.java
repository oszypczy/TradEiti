package com.example.usos_oauth.usos.model.usos;

import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UsosUser {
    private String id;
    private String firstName;
    private String lastName;
}
