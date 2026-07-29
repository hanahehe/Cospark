package com.cospark.repository;

import com.cospark.domain.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockRepository extends JpaRepository<Block, Long> {

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}
