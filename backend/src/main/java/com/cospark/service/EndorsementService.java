package com.cospark.service;

import com.cospark.domain.entity.Endorsement;
import com.cospark.domain.entity.User;
import com.cospark.dto.request.EndorsementCreateRequest;
import com.cospark.dto.response.EndorsementResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.EndorsementRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EndorsementService {

    private final EndorsementRepository endorsementRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Transactional
    public EndorsementResponse endorse(Long endorserId, Long endorsedId, EndorsementCreateRequest request) {
        if (endorsementRepository.existsByEndorserIdAndEndorsedIdAndSkill(endorserId, endorsedId, request.getSkill())) {
            throw new ApiException("Already endorsed this skill", HttpStatus.CONFLICT);
        }
        User endorser = userRepository.findById(endorserId).orElseThrow();
        User endorsed = userRepository.findById(endorsedId).orElseThrow();
        Endorsement e = Endorsement.builder()
                .endorser(endorser)
                .endorsed(endorsed)
                .skill(request.getSkill())
                .message(request.getMessage())
                .build();
        return mapper.toEndorsementResponse(endorsementRepository.save(e));
    }
}
