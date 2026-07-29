package com.cospark.repository;

import com.cospark.domain.entity.Profile;
import com.cospark.domain.enums.Availability;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUserId(Long userId);

    @Query("""
        SELECT DISTINCT p FROM Profile p
        JOIN p.user u
        WHERE u.active = true
        AND (:skill IS NULL OR :skill MEMBER OF p.skills)
        AND (:interest IS NULL OR :interest MEMBER OF p.interests)
        AND (:availability IS NULL OR p.availability = :availability)
        AND (:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:timezone IS NULL OR p.timezone = :timezone)
        AND u.id NOT IN (
            SELECT b.blocked.id FROM Block b WHERE b.blocker.id = :currentUserId
        )
        AND u.id NOT IN (
            SELECT b.blocker.id FROM Block b WHERE b.blocked.id = :currentUserId
        )
        AND u.id <> :currentUserId
        """)
    Page<Profile> searchProfiles(
            @Param("currentUserId") Long currentUserId,
            @Param("skill") String skill,
            @Param("interest") String interest,
            @Param("availability") Availability availability,
            @Param("location") String location,
            @Param("timezone") String timezone,
            Pageable pageable);
}
