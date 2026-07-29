package com.cospark.service;

import com.cospark.domain.entity.*;
import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.dto.request.ChatMessageRequest;
import com.cospark.dto.request.EndorsementCreateRequest;
import com.cospark.dto.response.ChatMessageResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.dto.response.SubscriptionInfoResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CollaborationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> getMessages(Long userId, Long conversationId, int page, int size) {
        verifyAccess(userId, conversationId);
        Page<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId,
                PageRequest.of(page, size));
        return mapper.toPageResponse(messages.map(mapper::toChatMessageResponse));
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long userId, Long conversationId, ChatMessageRequest request) {
        verifyAccess(userId, conversationId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ApiException("Conversation not found", HttpStatus.NOT_FOUND));
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .build();
        message = messageRepository.save(message);

        ChatMessageResponse response = mapper.toChatMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, response);
        return response;
    }

    private void verifyAccess(Long userId, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ApiException("Conversation not found", HttpStatus.NOT_FOUND));
        CollaborationRequest req = conv.getRequest();
        if (!req.getSender().getId().equals(userId) && !req.getRecipient().getId().equals(userId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
    }
}
