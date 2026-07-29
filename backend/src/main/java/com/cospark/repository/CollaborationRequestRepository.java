package com.cospark.repository;

import com.cospark.domain.entity.CollaborationRequest;
import com.cospark.domain.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {

    Page<CollaborationRequest> findBySenderId(Long senderId, Pageable pageable);

    Page<CollaborationRequest> findByRecipientId(Long recipientId, Pageable pageable);

    Page<CollaborationRequest> findBySenderIdAndStatus(Long senderId, RequestStatus status, Pageable pageable);

    Page<CollaborationRequest> findByRecipientIdAndStatus(Long recipientId, RequestStatus status, Pageable pageable);

    long countBySenderIdAndStatus(Long senderId, RequestStatus status);
}
