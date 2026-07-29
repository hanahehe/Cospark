package com.cospark.messaging;

import com.cospark.config.RabbitMQConfig;
import com.cospark.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageConsumers {

    private final MatchService matchService;
    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.MATCH_QUEUE)
    public void handleMatchRecompute(Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        log.info("Recomputing matches for user {}", userId);
        matchService.invalidateCache(userId);
        matchService.getRecommendations(userId, 10);
    }

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleEmail(Map<String, Object> payload) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo((String) payload.get("to"));
            message.setSubject((String) payload.get("subject"));
            message.setText((String) payload.get("body"));
            mailSender.send(message);
            log.info("Email sent to {}", payload.get("to"));
        } catch (Exception e) {
            log.warn("Failed to send email: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleNotificationFanout(Map<String, Object> payload) {
        log.info("Notification fan-out processed for user {}", payload.get("userId"));
    }
}
