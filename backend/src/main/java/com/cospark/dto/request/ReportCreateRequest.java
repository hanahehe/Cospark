package com.cospark.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportCreateRequest {

    private Long reportedUserId;
    private Long reportedIdeaId;

    @NotBlank
    private String reason;

    private String description;
}
