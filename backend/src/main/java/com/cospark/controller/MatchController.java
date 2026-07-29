package com.cospark.controller;

import com.cospark.dto.response.MatchRecommendationResponse;
import com.cospark.security.SecurityUtils;
import com.cospark.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<List<MatchRecommendationResponse>> getMatches(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(matchService.getRecommendations(SecurityUtils.getCurrentUserId(), limit));
    }
}
