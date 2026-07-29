package com.cospark.dto.response;

import com.cospark.domain.enums.IdeaStage;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class IdeaResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String title;
    private String domain;
    private String description;
    private IdeaStage stage;
    private String equityOffered;
    private String roleExpectations;
    private boolean active;
    private List<OpenRoleResponse> openRoles;
    private Instant createdAt;
    private Instant updatedAt;
}
