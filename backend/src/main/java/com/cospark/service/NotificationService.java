package com.cospark.service;

import com.cospark.config.RabbitMQConfig;
import com.cospark.domain.entity.Notification;
import com.cospark.domain.entity.User;
import com.cospark.dto.response.NotificationResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.NotificationRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Notification createNotification(Long userId, String type, String title, String body, String link) {
        User user = userRepository.getReferenceById(userId);
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .build();
        notification = notificationRepository.save(notification);

        NotificationResponse response = mapper.toNotificationResponse(notification);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId), "/queue/notifications", response);

        Map<String, Object> emailPayload = new HashMap<>();
        emailPayload.put("userId", userId);
        emailPayload.put("title", title);
        emailPayload.put("body", body);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "email.notification", emailPayload);

        return notification;
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(Long userId, int page, int size) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(page, size));
        return mapper.toPageResponse(notifications.map(mapper::toNotificationResponse));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    @Transactional
    public void markRead(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
