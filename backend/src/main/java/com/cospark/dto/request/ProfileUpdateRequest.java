package com.cospark.dto.request;

import com.cospark.domain.enums.Availability;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class ProfileUpdateRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String bio;
    private String headline;
    private String location;
    private String timezone;
    private Availability availability;
    private String linkedinUrl;
    private String portfolioUrl;
    private Integer yearsExperience;
    private Set<String> skills;
    private Set<String> interests;
}
