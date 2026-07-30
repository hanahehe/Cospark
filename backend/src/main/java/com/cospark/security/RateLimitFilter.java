package com.cospark.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Fixed-window rate limit backed by Redis so it holds correctly across
 * multiple backend instances, not just per-process. Auth endpoints get a
 * tighter window since they're the brute-force/credential-stuffing target.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;

    @Value("${cospark.rate-limit.requests-per-minute}")
    private int defaultLimit;

    @Value("${cospark.rate-limit.auth-requests-per-minute}")
    private int authLimit;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean isAuthPath = path.startsWith("/api/auth/");
        int limit = isAuthPath ? authLimit : defaultLimit;
        String bucket = isAuthPath ? "auth" : "general";
        long window = System.currentTimeMillis() / 60_000;
        String key = "ratelimit:" + bucket + ":" + clientIp(request) + ":" + window;

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, Duration.ofSeconds(70));
        }

        if (count != null && count > limit) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests — please slow down.\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
