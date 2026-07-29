package com.cospark.service;

import com.cospark.dto.request.RegisterRequest;
import com.cospark.exception.ApiException;
import com.cospark.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private com.cospark.repository.ProfileRepository profileRepository;
    @Mock private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Mock private com.cospark.security.JwtTokenProvider tokenProvider;
    @Mock private org.springframework.security.authentication.AuthenticationManager authenticationManager;
    @Mock private com.cospark.mapper.EntityMapper mapper;
    @Mock private org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerFailsWhenEmailExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        req.setFirstName("Test");
        req.setLastName("User");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(req));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }
}
