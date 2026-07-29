package com.cospark.repository;

import com.cospark.domain.entity.Endorsement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EndorsementRepository extends JpaRepository<Endorsement, Long> {

    List<Endorsement> findByEndorsedId(Long endorsedId);

    boolean existsByEndorserIdAndEndorsedIdAndSkill(Long endorserId, Long endorsedId, String skill);
}
