package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MatchRecommendationResponse {
    private ProfileResponse profile;
    private double score;
    private MatchBreakdown breakdown;
    private String summary;

    @Data
    @Builder
    public static class MatchBreakdown {
        private double skillOverlap;
        private double interestOverlap;
        private double availabilityFit;
        private double domainFit;
        private List<String> sharedSkills;
        private List<String> sharedInterests;
    }
}
