package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private String link;
    private boolean read;
    private Instant createdAt;
}
