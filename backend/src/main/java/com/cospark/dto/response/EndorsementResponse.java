package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EndorsementResponse {
    private Long id;
    private String skill;
    private String message;
    private String endorserName;
    private Instant createdAt;
}
