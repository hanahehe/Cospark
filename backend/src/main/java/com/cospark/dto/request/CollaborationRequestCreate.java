package com.cospark.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CollaborationRequestCreate {

    @NotNull
    private Long recipientId;

    private Long ideaId;
    private Long openRoleId;
    private String message;
}
