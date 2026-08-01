package com.cospark.security;

import com.cospark.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Authenticates and authorizes STOMP traffic on the /ws endpoint.
 *
 * <p>The HTTP handshake for a WebSocket cannot carry an Authorization header from the
 * browser, so /ws/** is permitAll in SecurityConfig. That means the JWT check has to
 * happen here instead, at the STOMP layer:
 *
 * <ul>
 *   <li><b>CONNECT</b> must present a valid JWT, or the connection is refused.</li>
 *   <li><b>SUBSCRIBE</b> to /topic/chat/{id} must come from a participant of that
 *       conversation. Without this, anyone could subscribe to an arbitrary conversation
 *       id and receive two other people's private messages in real time.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Pattern CHAT_TOPIC = Pattern.compile("^/topic/chat/(\\d+)$");
    private static final String USER_ID_ATTR = "cospark.userId";

    private final JwtTokenProvider tokenProvider;
    private final ConversationRepository conversationRepository;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscription(accessor);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String token = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!StringUtils.hasText(token) || !tokenProvider.validateToken(token)) {
            throw new MessageDeliveryException("Unauthorized: a valid token is required to connect");
        }

        Long userId = tokenProvider.getUserIdFromToken(token);
        accessor.setUser(new StompPrincipal(String.valueOf(userId)));

        Map<String, Object> attributes = accessor.getSessionAttributes();
        if (attributes != null) {
            attributes.put(USER_ID_ATTR, userId);
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        Matcher matcher = CHAT_TOPIC.matcher(destination);
        if (!matcher.matches()) {
            // Not a chat topic; nothing conversation-specific to authorize.
            return;
        }

        Long userId = currentUserId(accessor);
        if (userId == null) {
            throw new MessageDeliveryException("Unauthorized: not authenticated");
        }

        Long conversationId = Long.valueOf(matcher.group(1));
        if (!conversationRepository.isParticipant(conversationId, userId)) {
            throw new MessageDeliveryException("Forbidden: not a participant in this conversation");
        }
    }

    private Long currentUserId(StompHeaderAccessor accessor) {
        Map<String, Object> attributes = accessor.getSessionAttributes();
        if (attributes != null && attributes.get(USER_ID_ATTR) instanceof Long userId) {
            return userId;
        }
        Principal principal = accessor.getUser();
        if (principal != null) {
            try {
                return Long.valueOf(principal.getName());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    /** Minimal Principal carrying the authenticated user id for the STOMP session. */
    record StompPrincipal(String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }
    }
}
