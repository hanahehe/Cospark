package com.cospark.dto.response;

import com.cospark.domain.enums.SubscriptionTier;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubscriptionInfoResponse {
    private SubscriptionTier tier;
    private int dailyRequestLimit;
    private int requestsUsedToday;
    private int requestsRemaining;
    private boolean canUpgrade;
}
