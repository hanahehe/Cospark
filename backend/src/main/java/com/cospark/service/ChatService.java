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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CollaborationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Returns the most recent slice of a conversation, in chronological order.
     *
     * <p>Fetching is newest-first so that page 0 is what the user actually wants to see
     * when they open a chat (and page 1, 2, ... walk backwards into history). Each page is
     * then reversed so messages still read top-to-bottom oldest-to-newest in the UI.
     */
    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> getMessages(Long userId, Long conversationId, int page, int size) {
        verifyAccess(userId, conversationId);

        Page<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId,
                PageRequest.of(page, size));

        List<ChatMessageResponse> chronological = new ArrayList<>(
                messages.getContent().stream().map(mapper::toChatMessageResponse).toList());
        Collections.reverse(chronological);

        return PageResponse.<ChatMessageResponse>builder()
                .content(chronological)
                .page(messages.getNumber())
                .size(messages.getSize())
                .totalElements(messages.getTotalElements())
                .totalPages(messages.getTotalPages())
                .last(messages.isLast())
                .build();
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
