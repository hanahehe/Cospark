package com.cospark.service;

import com.cospark.domain.entity.Block;
import com.cospark.domain.entity.Report;
import com.cospark.domain.entity.User;
import com.cospark.dto.request.ReportCreateRequest;
import com.cospark.repository.BlockRepository;
import com.cospark.repository.ReportRepository;
import com.cospark.repository.StartupIdeaRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final StartupIdeaRepository ideaRepository;
    private final BlockRepository blockRepository;

    @Transactional
    public void createReport(Long reporterId, ReportCreateRequest request) {
        User reporter = userRepository.findById(reporterId).orElseThrow();
        Report.ReportBuilder builder = Report.builder()
                .reporter(reporter)
                .reason(request.getReason())
                .description(request.getDescription());
        if (request.getReportedUserId() != null) {
            builder.reportedUser(userRepository.findById(request.getReportedUserId()).orElseThrow());
        }
        if (request.getReportedIdeaId() != null) {
            builder.reportedIdea(ideaRepository.findById(request.getReportedIdeaId()).orElseThrow());
        }
        reportRepository.save(builder.build());
    }

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) return;
        if (!blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            User blocker = userRepository.findById(blockerId).orElseThrow();
            User blocked = userRepository.findById(blockedId).orElseThrow();
            blockRepository.save(Block.builder().blocker(blocker).blocked(blocked).build());
        }
    }
}
