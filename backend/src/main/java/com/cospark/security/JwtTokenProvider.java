package com.cospark.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;
    private final StringRedisTemplate redisTemplate;

    public JwtTokenProvider(
            @Value("${cospark.jwt.secret}") String secret,
            @Value("${cospark.jwt.expiration-ms}") long expirationMs,
            @Value("${cospark.jwt.refresh-expiration-ms}") long refreshExpirationMs,
            StringRedisTemplate redisTemplate) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(secret.getBytes())));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.redisTemplate = redisTemplate;
    }

    public String generateAccessToken(Long userId, String email) {
        return buildToken(userId, email, expirationMs, "access");
    }

    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, refreshExpirationMs, "refresh");
    }

    private String buildToken(Long userId, String email, long expiry, String type) {
        Instant now = Instant.now();
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .id(jti)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("type", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expiry)))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            String jti = claims.getId();
            if (Boolean.TRUE.equals(redisTemplate.hasKey(blacklistKey(jti)))) {
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public void blacklistToken(String token) {
        Claims claims = parseClaims(token);
        String jti = claims.getId();
        Date expiry = claims.getExpiration();
        long ttl = expiry.getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            redisTemplate.opsForValue().set(blacklistKey(jti), "1", Duration.ofMillis(ttl));
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String blacklistKey(String jti) {
        return "token:blacklist:" + jti;
    }
}
