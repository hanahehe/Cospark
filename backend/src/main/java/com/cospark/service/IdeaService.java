package com.cospark.service;

import com.cospark.config.RabbitMQConfig;
import com.cospark.domain.entity.*;
import com.cospark.domain.enums.IdeaStage;
import com.cospark.domain.enums.RequestStatus;
import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.dto.request.IdeaCreateRequest;
import com.cospark.dto.response.IdeaResponse;
import com.cospark.dto.response.PageResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IdeaService {

    private final StartupIdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<IdeaResponse> listIdeas(String domain, String stage, String query, int page, int size) {
        Page<StartupIdea> ideas = ideaRepository.searchIdeas(domain, stage, query,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapper.toPageResponse(ideas.map(mapper::toIdeaResponse));
    }

    @Transactional(readOnly = true)
    public IdeaResponse getIdea(Long id) {
        StartupIdea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Idea not found", HttpStatus.NOT_FOUND));
        return mapper.toIdeaResponse(idea);
    }

    @Transactional(readOnly = true)
    public PageResponse<IdeaResponse> getMyIdeas(Long userId, int page, int size) {
        Page<StartupIdea> ideas = ideaRepository.findByOwnerIdAndActiveTrue(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapper.toPageResponse(ideas.map(mapper::toIdeaResponse));
    }

    @Transactional
    public IdeaResponse createIdea(Long userId, IdeaCreateRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        StartupIdea idea = StartupIdea.builder()
                .owner(owner)
                .title(request.getTitle())
                .domain(request.getDomain())
                .description(request.getDescription())
                .stage(request.getStage() != null ? request.getStage() : IdeaStage.IDEA)
                .equityOffered(request.getEquityOffered())
                .roleExpectations(request.getRoleExpectations())
                .openRoles(new ArrayList<>())
                .build();

        if (request.getOpenRoles() != null) {
            for (IdeaCreateRequest.OpenRoleRequest roleReq : request.getOpenRoles()) {
                OpenRole role = OpenRole.builder()
                        .idea(idea)
                        .title(roleReq.getTitle())
                        .description(roleReq.getDescription())
                        .skillsRequired(roleReq.getSkillsRequired() != null ? roleReq.getSkillsRequired() : new ArrayList<>())
                        .build();
                idea.getOpenRoles().add(role);
            }
        }

        idea = ideaRepository.save(idea);
        return mapper.toIdeaResponse(idea);
    }

    @Transactional
    public IdeaResponse updateIdea(Long userId, Long ideaId, IdeaCreateRequest request) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ApiException("Idea not found", HttpStatus.NOT_FOUND));
        if (!idea.getOwner().getId().equals(userId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }

        idea.setTitle(request.getTitle());
        idea.setDomain(request.getDomain());
        idea.setDescription(request.getDescription());
        if (request.getStage() != null) idea.setStage(request.getStage());
        idea.setEquityOffered(request.getEquityOffered());
        idea.setRoleExpectations(request.getRoleExpectations());

        idea = ideaRepository.save(idea);
        return mapper.toIdeaResponse(idea);
    }

    @Transactional
    public void deleteIdea(Long userId, Long ideaId) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ApiException("Idea not found", HttpStatus.NOT_FOUND));
        if (!idea.getOwner().getId().equals(userId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
        idea.setActive(false);
        ideaRepository.save(idea);
    }
}
