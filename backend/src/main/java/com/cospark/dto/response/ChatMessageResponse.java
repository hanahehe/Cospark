package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private Instant createdAt;
}
