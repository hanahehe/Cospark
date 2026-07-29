package com.cospark.service;

import com.cospark.config.RabbitMQConfig;
import com.cospark.domain.entity.Profile;
import com.cospark.domain.entity.User;
import com.cospark.domain.enums.SubscriptionTier;
import com.cospark.dto.request.LoginRequest;
import com.cospark.dto.request.RegisterRequest;
import com.cospark.dto.response.AuthResponse;
import com.cospark.dto.response.UserSummary;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.ProfileRepository;
import com.cospark.repository.UserRepository;
import com.cospark.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EntityMapper mapper;
    private final RabbitTemplate rabbitTemplate;

    @Value("${cospark.frontend-url}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        String token = UUID.randomUUID().toString();
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verificationToken(token)
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        profileRepository.save(profile);
        user.setProfile(profile);

        sendVerificationEmail(user.getEmail(), token);

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new ApiException("Account deactivated", HttpStatus.FORBIDDEN);
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ApiException("Invalid verification token", HttpStatus.BAD_REQUEST));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public void logout(String token) {
        if (token != null) {
            tokenProvider.blacklistToken(token);
        }
    }

    @Transactional(readOnly = true)
    public UserSummary getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return mapper.toUserSummary(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String access = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refresh = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .user(mapper.toUserSummary(user))
                .build();
    }

    private void sendVerificationEmail(String email, String token) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("to", email);
        payload.put("subject", "Verify your CoSpark account");
        payload.put("body", "Click to verify: " + frontendUrl + "/verify?token=" + token);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "email.send", payload);
    }
}
