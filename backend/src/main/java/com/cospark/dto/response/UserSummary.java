package com.cospark.dto.response;

import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.domain.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummary {
    private Long id;
    private String email;
    private UserRole role;
    private boolean emailVerified;
    private SubscriptionTier subscriptionTier;
    private String firstName;
    private String lastName;
}
