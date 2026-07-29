package com.cospark.controller;

import com.cospark.dto.request.ChatMessageRequest;
import com.cospark.dto.request.EndorsementCreateRequest;
import com.cospark.dto.request.ReportCreateRequest;
import com.cospark.dto.response.*;
import com.cospark.domain.enums.ReportStatus;
import com.cospark.security.SecurityUtils;
import com.cospark.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
class ChatController {

    private final ChatService chatService;

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<PageResponse<ChatMessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getMessages(SecurityUtils.getCurrentUserId(), conversationId, page, size));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(SecurityUtils.getCurrentUserId(), conversationId, request));
    }
}

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    public ResponseEntity<PageResponse<ProfileResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookmarkService.getBookmarks(SecurityUtils.getCurrentUserId(), page, size));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, String>> toggle(@PathVariable Long userId) {
        bookmarkService.toggleBookmark(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.ok(Map.of("message", "Bookmark toggled"));
    }
}

@RestController
@RequestMapping("/api/endorsements")
@RequiredArgsConstructor
class EndorsementController {

    private final EndorsementService endorsementService;

    @PostMapping("/{userId}")
    public ResponseEntity<EndorsementResponse> endorse(
            @PathVariable Long userId,
            @Valid @RequestBody EndorsementCreateRequest request) {
        return ResponseEntity.ok(endorsementService.endorse(SecurityUtils.getCurrentUserId(), userId, request));
    }
}

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<SubscriptionInfoResponse> info() {
        return ResponseEntity.ok(subscriptionService.getSubscriptionInfo(SecurityUtils.getCurrentUserId()));
    }
}

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Void> report(@Valid @RequestBody ReportCreateRequest request) {
        reportService.createReport(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/block/{userId}")
    public ResponseEntity<Void> block(@PathVariable Long userId) {
        reportService.blockUser(SecurityUtils.getCurrentUserId(), userId);
        return ResponseEntity.noContent().build();
    }
}

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> metrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserSummary>> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.listUsers(page, size));
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        adminService.deactivateUser(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    public ResponseEntity<PageResponse<com.cospark.domain.entity.Report>> reports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.listReports(page, size));
    }

    @PatchMapping("/reports/{id}")
    public ResponseEntity<Void> resolveReport(@PathVariable Long id, @RequestParam ReportStatus status) {
        adminService.resolveReport(SecurityUtils.getCurrentUserId(), id, status);
        return ResponseEntity.noContent().build();
    }
}
