package com.cospark.repository;

import com.cospark.domain.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByRequestId(Long requestId);

    /**
     * Answers "is this user one of the two people in this conversation?" in a single
     * query. Deliberately avoids walking Conversation -> request -> sender/recipient in
     * Java: the WebSocket interceptor that calls this runs outside any transaction, so
     * touching those lazy associations there would throw LazyInitializationException.
     */
    @Query("""
        SELECT COUNT(c) > 0 FROM Conversation c
        WHERE c.id = :conversationId
          AND (c.request.sender.id = :userId OR c.request.recipient.id = :userId)
        """)
    boolean isParticipant(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
