package com.cospark.controller;

import com.cospark.dto.request.IdeaCreateRequest;
import com.cospark.dto.response.IdeaResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.security.SecurityUtils;
import com.cospark.service.IdeaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;

    @GetMapping
    public ResponseEntity<PageResponse<IdeaResponse>> listIdeas(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ideaService.listIdeas(domain, stage, query, page, size));
    }

    @GetMapping("/mine")
    public ResponseEntity<PageResponse<IdeaResponse>> myIdeas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ideaService.getMyIdeas(SecurityUtils.getCurrentUserId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdeaResponse> getIdea(@PathVariable Long id) {
        return ResponseEntity.ok(ideaService.getIdea(id));
    }

    @PostMapping
    public ResponseEntity<IdeaResponse> createIdea(@Valid @RequestBody IdeaCreateRequest request) {
        return ResponseEntity.ok(ideaService.createIdea(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IdeaResponse> updateIdea(@PathVariable Long id, @Valid @RequestBody IdeaCreateRequest request) {
        return ResponseEntity.ok(ideaService.updateIdea(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIdea(@PathVariable Long id) {
        ideaService.deleteIdea(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
