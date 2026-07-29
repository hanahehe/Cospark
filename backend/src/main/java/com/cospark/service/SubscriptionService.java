package com.cospark.service;

import com.cospark.domain.entity.User;
import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.dto.response.SubscriptionInfoResponse;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserRepository userRepository;

    @Value("${cospark.freemium.daily-request-limit:5}")
    private int dailyLimit;

    @Transactional(readOnly = true)
    public SubscriptionInfoResponse getSubscriptionInfo(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LocalDate today = LocalDate.now();
        int used = (user.getRequestsResetDate() != null && user.getRequestsResetDate().equals(today))
                ? user.getRequestsSentToday() : 0;
        return SubscriptionInfoResponse.builder()
                .tier(user.getSubscriptionTier())
                .dailyRequestLimit(user.getSubscriptionTier() == SubscriptionTier.FREE ? dailyLimit : -1)
                .requestsUsedToday(used)
                .requestsRemaining(user.getSubscriptionTier() == SubscriptionTier.FREE ? Math.max(0, dailyLimit - used) : -1)
                .canUpgrade(user.getSubscriptionTier() == SubscriptionTier.FREE)
                .build();
    }
}
