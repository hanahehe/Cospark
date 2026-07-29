package com.cospark.repository;

import com.cospark.domain.entity.StartupIdea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StartupIdeaRepository extends JpaRepository<StartupIdea, Long> {

    Page<StartupIdea> findByActiveTrue(Pageable pageable);

    Page<StartupIdea> findByOwnerIdAndActiveTrue(Long ownerId, Pageable pageable);

    @Query("""
        SELECT i FROM StartupIdea i
        WHERE i.active = true
        AND (:domain IS NULL OR i.domain = :domain)
        AND (:stage IS NULL OR i.stage = :stage)
        AND (:query IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%')))
        """)
    Page<StartupIdea> searchIdeas(
            @Param("domain") String domain,
            @Param("stage") String stage,
            @Param("query") String query,
            Pageable pageable);
}
