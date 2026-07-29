package com.cospark.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "endorsements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endorsement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endorser_id", nullable = false)
    private User endorser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endorsed_id", nullable = false)
    private User endorsed;

    @Column(nullable = false, length = 100)
    private String skill;

    @Column(length = 500)
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
