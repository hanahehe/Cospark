package com.cospark.service;

import com.cospark.config.RabbitMQConfig;
import com.cospark.domain.entity.*;
import com.cospark.domain.enums.Availability;
import com.cospark.domain.enums.RequestStatus;
import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.dto.request.CollaborationRequestCreate;
import com.cospark.dto.response.CollaborationRequestResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CollaborationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final StartupIdeaRepository ideaRepository;
    private final ConversationRepository conversationRepository;
    private final BlockRepository blockRepository;
    private final EntityMapper mapper;
    private final NotificationService notificationService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${cospark.freemium.daily-request-limit:5}")
    private int dailyRequestLimit;

    @Transactional
    public CollaborationRequestResponse sendRequest(Long senderId, CollaborationRequestCreate req) {
        if (senderId.equals(req.getRecipientId())) {
            throw new ApiException("Cannot send request to yourself", HttpStatus.BAD_REQUEST);
        }

        if (blockRepository.existsByBlockerIdAndBlockedId(req.getRecipientId(), senderId) ||
            blockRepository.existsByBlockerIdAndBlockedId(senderId, req.getRecipientId())) {
            throw new ApiException("Cannot send request to this user", HttpStatus.FORBIDDEN);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ApiException("Sender not found", HttpStatus.NOT_FOUND));
        checkFreemiumLimit(sender);

        User recipient = userRepository.findById(req.getRecipientId())
                .orElseThrow(() -> new ApiException("Recipient not found", HttpStatus.NOT_FOUND));

        StartupIdea idea = null;
        OpenRole openRole = null;
        if (req.getIdeaId() != null) {
            idea = ideaRepository.findById(req.getIdeaId())
                    .orElseThrow(() -> new ApiException("Idea not found", HttpStatus.NOT_FOUND));
            if (req.getOpenRoleId() != null) {
                openRole = idea.getOpenRoles().stream()
                        .filter(r -> r.getId().equals(req.getOpenRoleId()))
                        .findFirst()
                        .orElseThrow(() -> new ApiException("Open role not found", HttpStatus.NOT_FOUND));
            }
        }

        CollaborationRequest request = CollaborationRequest.builder()
                .sender(sender)
                .recipient(recipient)
                .idea(idea)
                .openRole(openRole)
                .message(req.getMessage())
                .build();

        request = requestRepository.save(request);
        incrementRequestCount(sender);

        notificationService.createNotification(
                recipient.getId(), "COLLAB_REQUEST", "New collaboration request",
                sender.getProfile().getFirstName() + " wants to connect with you",
                "/requests");

        return mapper.toRequestResponse(request, null);
    }

    @Transactional
    public CollaborationRequestResponse respondToRequest(Long userId, Long requestId, RequestStatus status) {
        CollaborationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException("Request not found", HttpStatus.NOT_FOUND));

        if (!request.getRecipient().getId().equals(userId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ApiException("Request already processed", HttpStatus.BAD_REQUEST);
        }

        request.setStatus(status);
        request = requestRepository.save(request);

        Long conversationId = null;
        if (status == RequestStatus.ACCEPTED) {
            Conversation conversation = Conversation.builder().request(request).build();
            conversation = conversationRepository.save(conversation);
            conversationId = conversation.getId();

            if (request.getOpenRole() != null) {
                request.getOpenRole().setFilled(true);
            }
        }

        String notifTitle = status == RequestStatus.ACCEPTED ? "Request accepted!" : "Request declined";
        notificationService.createNotification(
                request.getSender().getId(), "COLLAB_RESPONSE", notifTitle,
                request.getRecipient().getProfile().getFirstName() + " responded to your request",
                "/requests");

        return mapper.toRequestResponse(request, conversationId);
    }

    @Transactional(readOnly = true)
    public PageResponse<CollaborationRequestResponse> getSentRequests(Long userId, int page, int size) {
        Page<CollaborationRequest> requests = requestRepository.findBySenderId(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapper.toPageResponse(requests.map(r -> {
            Long convId = conversationRepository.findByRequestId(r.getId()).map(Conversation::getId).orElse(null);
            return mapper.toRequestResponse(r, convId);
        }));
    }

    @Transactional(readOnly = true)
    public PageResponse<CollaborationRequestResponse> getReceivedRequests(Long userId, int page, int size) {
        Page<CollaborationRequest> requests = requestRepository.findByRecipientId(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapper.toPageResponse(requests.map(r -> {
            Long convId = conversationRepository.findByRequestId(r.getId()).map(Conversation::getId).orElse(null);
            return mapper.toRequestResponse(r, convId);
        }));
    }

    private void checkFreemiumLimit(User sender) {
        if (sender.getSubscriptionTier() != SubscriptionTier.FREE) return;

        LocalDate today = LocalDate.now();
        if (sender.getRequestsResetDate() == null || !sender.getRequestsResetDate().equals(today)) {
            sender.setRequestsSentToday(0);
            sender.setRequestsResetDate(today);
        }

        if (sender.getRequestsSentToday() >= dailyRequestLimit) {
            throw new ApiException(
                    "Daily request limit reached (" + dailyRequestLimit + "). Upgrade to Pro for unlimited requests.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    private void incrementRequestCount(User sender) {
        if (sender.getSubscriptionTier() == SubscriptionTier.FREE) {
            sender.setRequestsSentToday(sender.getRequestsSentToday() + 1);
            userRepository.save(sender);
        }
    }
}
