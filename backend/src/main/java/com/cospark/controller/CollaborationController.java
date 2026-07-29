package com.cospark.controller;

import com.cospark.domain.enums.RequestStatus;
import com.cospark.dto.request.CollaborationRequestCreate;
import com.cospark.dto.response.CollaborationRequestResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.security.SecurityUtils;
import com.cospark.service.CollaborationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @PostMapping
    public ResponseEntity<CollaborationRequestResponse> send(@Valid @RequestBody CollaborationRequestCreate request) {
        return ResponseEntity.ok(collaborationService.sendRequest(SecurityUtils.getCurrentUserId(), request));
    }

    @GetMapping("/sent")
    public ResponseEntity<PageResponse<CollaborationRequestResponse>> sent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(collaborationService.getSentRequests(SecurityUtils.getCurrentUserId(), page, size));
    }

    @GetMapping("/received")
    public ResponseEntity<PageResponse<CollaborationRequestResponse>> received(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(collaborationService.getReceivedRequests(SecurityUtils.getCurrentUserId(), page, size));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<CollaborationRequestResponse> accept(@PathVariable Long id) {
        return ResponseEntity.ok(collaborationService.respondToRequest(SecurityUtils.getCurrentUserId(), id, RequestStatus.ACCEPTED));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<CollaborationRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(collaborationService.respondToRequest(SecurityUtils.getCurrentUserId(), id, RequestStatus.REJECTED));
    }
}
