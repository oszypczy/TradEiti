package com.example.usos_oauth.offers.model.dto;

import com.example.usos_oauth.usos.model.dto.CourseDTO;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateOfferRequest {
    private CourseDTO myCourse;
    private CourseDTO wantedCourse;
}
