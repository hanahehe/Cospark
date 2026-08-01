package com.cospark.controller;

import com.cospark.domain.enums.Availability;
import com.cospark.dto.request.ProfileUpdateRequest;
import com.cospark.dto.response.PageResponse;
import com.cospark.dto.response.ProfileResponse;
import com.cospark.security.SecurityUtils;
import com.cospark.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getProfile(userId, userId));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(SecurityUtils.getCurrentUserId(), request));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.uploadAvatar(SecurityUtils.getCurrentUserId(), file));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<ProfileResponse>> search(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String interest,
            @RequestParam(required = false) Availability availability,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String timezone,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(profileService.searchProfiles(
                SecurityUtils.getCurrentUserId(), skill, interest, availability, location, timezone, page, size));
    }
}
