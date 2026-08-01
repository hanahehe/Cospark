package com.cospark.mapper;

import com.cospark.domain.entity.*;
import com.cospark.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
public class EntityMapper {

    public UserSummary toUserSummary(User user) {
        String firstName = user.getProfile() != null ? user.getProfile().getFirstName() : null;
        String lastName = user.getProfile() != null ? user.getProfile().getLastName() : null;
        return UserSummary.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .subscriptionTier(user.getSubscriptionTier())
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }

    public ProfileResponse toProfileResponse(Profile profile, boolean bookmarked, List<EndorsementResponse> endorsements) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .bio(profile.getBio())
                .headline(profile.getHeadline())
                .location(profile.getLocation())
                .timezone(profile.getTimezone())
                .availability(profile.getAvailability())
                .linkedinUrl(profile.getLinkedinUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .avatarUrl(profile.getAvatarUrl())
                .yearsExperience(profile.getYearsExperience())
                .skills(new HashSet<>(profile.getSkills()))
                .interests(new HashSet<>(profile.getInterests()))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .bookmarked(bookmarked)
                .endorsements(endorsements)
                .build();
    }

    public EndorsementResponse toEndorsementResponse(Endorsement e) {
        String name = e.getEndorser().getProfile() != null
                ? e.getEndorser().getProfile().getFirstName() + " " + e.getEndorser().getProfile().getLastName()
                : e.getEndorser().getEmail();
        return EndorsementResponse.builder()
                .id(e.getId())
                .skill(e.getSkill())
                .message(e.getMessage())
                .endorserName(name)
                .createdAt(e.getCreatedAt())
                .build();
    }

    public IdeaResponse toIdeaResponse(StartupIdea idea) {
        String ownerName = idea.getOwner().getProfile() != null
                ? idea.getOwner().getProfile().getFirstName() + " " + idea.getOwner().getProfile().getLastName()
                : idea.getOwner().getEmail();
        return IdeaResponse.builder()
                .id(idea.getId())
                .ownerId(idea.getOwner().getId())
                .ownerName(ownerName)
                .title(idea.getTitle())
                .domain(idea.getDomain())
                .description(idea.getDescription())
                .stage(idea.getStage())
                .equityOffered(idea.getEquityOffered())
                .roleExpectations(idea.getRoleExpectations())
                .active(idea.isActive())
                .openRoles(idea.getOpenRoles().stream().map(this::toOpenRoleResponse).toList())
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .build();
    }

    public OpenRoleResponse toOpenRoleResponse(OpenRole role) {
        return OpenRoleResponse.builder()
                .id(role.getId())
                .title(role.getTitle())
                .description(role.getDescription())
                .skillsRequired(role.getSkillsRequired())
                .filled(role.isFilled())
                .createdAt(role.getCreatedAt())
                .build();
    }

    public CollaborationRequestResponse toRequestResponse(CollaborationRequest req, Long conversationId) {
        String senderName = req.getSender().getProfile() != null
                ? req.getSender().getProfile().getFirstName() + " " + req.getSender().getProfile().getLastName()
                : req.getSender().getEmail();
        String recipientName = req.getRecipient().getProfile() != null
                ? req.getRecipient().getProfile().getFirstName() + " " + req.getRecipient().getProfile().getLastName()
                : req.getRecipient().getEmail();
        return CollaborationRequestResponse.builder()
                .id(req.getId())
                .senderId(req.getSender().getId())
                .senderName(senderName)
                .recipientId(req.getRecipient().getId())
                .recipientName(recipientName)
                .ideaId(req.getIdea() != null ? req.getIdea().getId() : null)
                .ideaTitle(req.getIdea() != null ? req.getIdea().getTitle() : null)
                .openRoleId(req.getOpenRole() != null ? req.getOpenRole().getId() : null)
                .openRoleTitle(req.getOpenRole() != null ? req.getOpenRole().getTitle() : null)
                .message(req.getMessage())
                .status(req.getStatus())
                .conversationId(conversationId)
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    public NotificationResponse toNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .link(n.getLink())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    public ChatMessageResponse toChatMessageResponse(ChatMessage msg) {
        String senderName = msg.getSender().getProfile() != null
                ? msg.getSender().getProfile().getFirstName()
                : msg.getSender().getEmail();
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(msg.getSender().getId())
                .senderName(senderName)
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    public <T> PageResponse<T> toPageResponse(org.springframework.data.domain.Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
