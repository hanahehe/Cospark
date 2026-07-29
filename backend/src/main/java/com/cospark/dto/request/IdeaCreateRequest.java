package com.cospark.dto.request;

import com.cospark.domain.enums.IdeaStage;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class IdeaCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String domain;

    @NotBlank
    private String description;

    private IdeaStage stage;
    private String equityOffered;
    private String roleExpectations;
    private List<OpenRoleRequest> openRoles;

    @Data
    public static class OpenRoleRequest {
        @NotBlank
        private String title;
        private String description;
        private List<String> skillsRequired;
    }
}
