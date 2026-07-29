package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OpenRoleResponse {
    private Long id;
    private String title;
    private String description;
    private List<String> skillsRequired;
    private boolean filled;
    private Instant createdAt;
}
