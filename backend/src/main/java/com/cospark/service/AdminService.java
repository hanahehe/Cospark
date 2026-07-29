package com.cospark.service;

import com.cospark.domain.entity.*;
import com.cospark.domain.enums.ReportStatus;
import com.cospark.domain.enums.UserRole;
import com.cospark.dto.request.ReportCreateRequest;
import com.cospark.dto.response.AdminMetricsResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.dto.response.UserSummary;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StartupIdeaRepository ideaRepository;
    private final CollaborationRequestRepository requestRepository;
    private final ReportRepository reportRepository;
    private final AuditLogRepository auditLogRepository;
    private final EntityMapper mapper;

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        return AdminMetricsResponse.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countActiveUsers())
                .totalIdeas(ideaRepository.count())
                .pendingRequests(requestRepository.count())
                .openReports(reportRepository.countByStatus(ReportStatus.OPEN))
                .proUsers(userRepository.findAll().stream()
                        .filter(u -> u.getSubscriptionTier().name().equals("PRO")).count())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserSummary> listUsers(int page, int size) {
        Page<User> users = userRepository.findAll(PageRequest.of(page, size));
        return mapper.toPageResponse(users.map(mapper::toUserSummary));
    }

    @Transactional
    public void deactivateUser(Long adminId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        user.setActive(false);
        userRepository.save(user);
        logAction(adminId, "DEACTIVATE_USER", "USER", userId, Map.of("email", user.getEmail()));
    }

    @Transactional
    public void resolveReport(Long adminId, Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ApiException("Report not found", HttpStatus.NOT_FOUND));
        report.setStatus(status);
        report.setResolvedAt(Instant.now());
        reportRepository.save(report);
        logAction(adminId, "RESOLVE_REPORT", "REPORT", reportId, Map.of("status", status.name()));
    }

    @Transactional(readOnly = true)
    public PageResponse<Report> listReports(int page, int size) {
        Page<Report> reports = reportRepository.findByStatus(ReportStatus.OPEN, PageRequest.of(page, size));
        return mapper.toPageResponse(reports);
    }

    private void logAction(Long adminId, String action, String targetType, Long targetId, Map<String, Object> details) {
        User admin = userRepository.findById(adminId).orElseThrow();
        auditLogRepository.save(AuditLog.builder()
                .admin(admin)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build());
    }
}
