package com.cospark.dto.response;

import com.cospark.domain.enums.Availability;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String headline;
    private String location;
    private String timezone;
    private Availability availability;
    private String linkedinUrl;
    private String portfolioUrl;
    private String avatarUrl;
    private Integer yearsExperience;
    private Set<String> skills;
    private Set<String> interests;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean bookmarked;
    private List<EndorsementResponse> endorsements;
}
