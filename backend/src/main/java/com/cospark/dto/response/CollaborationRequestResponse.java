package com.cospark.dto.response;

import com.cospark.domain.enums.RequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CollaborationRequestResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String recipientName;
    private Long ideaId;
    private String ideaTitle;
    private Long openRoleId;
    private String openRoleTitle;
    private String message;
    private RequestStatus status;
    private Long conversationId;
    private Instant createdAt;
    private Instant updatedAt;
}
