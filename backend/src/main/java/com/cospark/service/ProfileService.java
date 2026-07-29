package com.cospark.service;

import com.cospark.domain.entity.Profile;
import com.cospark.domain.entity.User;
import com.cospark.domain.enums.Availability;
import com.cospark.dto.request.ProfileUpdateRequest;
import com.cospark.dto.response.EndorsementResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.dto.response.ProfileResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.BookmarkRepository;
import com.cospark.repository.EndorsementRepository;
import com.cospark.repository.ProfileRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final BookmarkRepository bookmarkRepository;
    private final EndorsementRepository endorsementRepository;
    private final EntityMapper mapper;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId, Long viewerId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", HttpStatus.NOT_FOUND));

        incrementProfileView(profile.getId(), viewerId);

        boolean bookmarked = viewerId != null &&
                bookmarkRepository.existsByUserIdAndBookmarkedUserId(viewerId, userId);

        List<EndorsementResponse> endorsements = endorsementRepository.findByEndorsedId(userId)
                .stream().map(mapper::toEndorsementResponse).toList();

        return mapper.toProfileResponse(profile, bookmarked, endorsements);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", HttpStatus.NOT_FOUND));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setBio(request.getBio());
        profile.setHeadline(request.getHeadline());
        profile.setLocation(request.getLocation());
        profile.setTimezone(request.getTimezone());
        if (request.getAvailability() != null) profile.setAvailability(request.getAvailability());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getYearsExperience() != null) profile.setYearsExperience(request.getYearsExperience());
        if (request.getSkills() != null) profile.setSkills(new HashSet<>(request.getSkills()));
        if (request.getInterests() != null) profile.setInterests(new HashSet<>(request.getInterests()));

        profile = profileRepository.save(profile);
        return mapper.toProfileResponse(profile, false, List.of());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProfileResponse> searchProfiles(
            Long currentUserId, String skill, String interest,
            Availability availability, String location, String timezone,
            int page, int size) {

        Page<Profile> results = profileRepository.searchProfiles(
                currentUserId, skill, interest, availability, location, timezone,
                PageRequest.of(page, size, Sort.by("updatedAt").descending()));

        return mapper.toPageResponse(results.map(p -> {
            boolean bookmarked = bookmarkRepository.existsByUserIdAndBookmarkedUserId(currentUserId, p.getUser().getId());
            return mapper.toProfileResponse(p, bookmarked, List.of());
        }));
    }

    private void incrementProfileView(Long profileId, Long viewerId) {
        if (viewerId == null) return;
        String key = "profile:views:" + profileId;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, Duration.ofDays(30));
    }
}
