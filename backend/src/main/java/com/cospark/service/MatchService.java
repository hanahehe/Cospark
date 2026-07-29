package com.cospark.service;

import com.cospark.domain.entity.Profile;
import com.cospark.domain.entity.StartupIdea;
import com.cospark.domain.entity.User;
import com.cospark.domain.enums.Availability;
import com.cospark.dto.response.MatchRecommendationResponse;
import com.cospark.dto.response.ProfileResponse;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.ProfileRepository;
import com.cospark.repository.StartupIdeaRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private static final double SKILL_WEIGHT = 0.35;
    private static final double INTEREST_WEIGHT = 0.25;
    private static final double AVAILABILITY_WEIGHT = 0.20;
    private static final double DOMAIN_WEIGHT = 0.20;

    private final ProfileRepository profileRepository;
    private final StartupIdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public List<MatchRecommendationResponse> getRecommendations(Long userId, int limit) {
        String cacheKey = "match:recs:" + userId;
        // Cache check - recompute if miss
        Profile myProfile = profileRepository.findByUserId(userId).orElse(null);
        if (myProfile == null) return List.of();

        Set<String> myDomains = ideaRepository.findByOwnerIdAndActiveTrue(userId, PageRequest.of(0, 10))
                .stream().map(StartupIdea::getDomain).collect(Collectors.toSet());

        var candidates = profileRepository.searchProfiles(
                userId, null, null, null, null, null, PageRequest.of(0, 50));

        List<MatchRecommendationResponse> matches = candidates.stream()
                .map(candidate -> scoreMatch(myProfile, candidate, myDomains))
                .sorted(Comparator.comparingDouble(MatchRecommendationResponse::getScore).reversed())
                .limit(limit)
                .toList();

        redisTemplate.opsForValue().set(cacheKey, String.valueOf(matches.size()), Duration.ofMinutes(15));
        return matches;
    }

    private MatchRecommendationResponse scoreMatch(Profile me, Profile them, Set<String> myDomains) {
        Set<String> mySkills = me.getSkills() != null ? me.getSkills() : Set.of();
        Set<String> theirSkills = them.getSkills() != null ? them.getSkills() : Set.of();
        Set<String> myInterests = me.getInterests() != null ? me.getInterests() : Set.of();
        Set<String> theirInterests = them.getInterests() != null ? them.getInterests() : Set.of();

        List<String> sharedSkills = mySkills.stream().filter(theirSkills::contains).toList();
        List<String> sharedInterests = myInterests.stream().filter(theirInterests::contains).toList();

        double skillScore = mySkills.isEmpty() ? 0 :
                (double) sharedSkills.size() / Math.max(mySkills.size(), theirSkills.size());
        double interestScore = myInterests.isEmpty() ? 0 :
                (double) sharedInterests.size() / Math.max(myInterests.size(), theirInterests.size());

        double availabilityScore = me.getAvailability() == them.getAvailability() ? 1.0 :
                (me.getAvailability() == Availability.EXPLORING || them.getAvailability() == Availability.EXPLORING) ? 0.5 : 0.3;

        Set<String> theirDomains = ideaRepository
                .findByOwnerIdAndActiveTrue(them.getUser().getId(), PageRequest.of(0, 10))
                .stream().map(StartupIdea::getDomain).collect(Collectors.toSet());
        double domainScore = 0;
        if (!myDomains.isEmpty() && !theirDomains.isEmpty()) {
            long overlap = myDomains.stream().filter(theirDomains::contains).count();
            domainScore = (double) overlap / Math.max(myDomains.size(), theirDomains.size());
        } else if (!myDomains.isEmpty() || !theirDomains.isEmpty()) {
            domainScore = 0.2;
        }

        double total = skillScore * SKILL_WEIGHT + interestScore * INTEREST_WEIGHT
                + availabilityScore * AVAILABILITY_WEIGHT + domainScore * DOMAIN_WEIGHT;

        String summary = buildSummary(sharedSkills, sharedInterests, me.getAvailability(), them.getAvailability());

        ProfileResponse profileResponse = mapper.toProfileResponse(them, false, List.of());

        return MatchRecommendationResponse.builder()
                .profile(profileResponse)
                .score(Math.round(total * 100) / 100.0)
                .breakdown(MatchRecommendationResponse.MatchBreakdown.builder()
                        .skillOverlap(Math.round(skillScore * 100) / 100.0)
                        .interestOverlap(Math.round(interestScore * 100) / 100.0)
                        .availabilityFit(Math.round(availabilityScore * 100) / 100.0)
                        .domainFit(Math.round(domainScore * 100) / 100.0)
                        .sharedSkills(sharedSkills)
                        .sharedInterests(sharedInterests)
                        .build())
                .summary(summary)
                .build();
    }

    private String buildSummary(List<String> skills, List<String> interests,
                                 Availability mine, Availability theirs) {
        List<String> parts = new ArrayList<>();
        if (!skills.isEmpty()) parts.add("Shared skills: " + String.join(", ", skills));
        if (!interests.isEmpty()) parts.add("Shared interests: " + String.join(", ", interests));
        if (mine == theirs) parts.add("Same availability (" + mine.name().replace('_', ' ').toLowerCase() + ")");
        return parts.isEmpty() ? "Potential complementary match" : String.join(". ", parts);
    }

    public void invalidateCache(Long userId) {
        redisTemplate.delete("match:recs:" + userId);
    }
}
