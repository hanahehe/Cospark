package com.cospark.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EndorsementCreateRequest {

    @NotBlank
    private String skill;

    private String message;
}
