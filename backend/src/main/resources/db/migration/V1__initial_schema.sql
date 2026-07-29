-- CoSpark initial schema

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    requests_sent_today INT NOT NULL DEFAULT 0,
    requests_reset_date DATE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_subscription (subscription_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    bio             TEXT,
    headline        VARCHAR(255),
    location        VARCHAR(150),
    timezone        VARCHAR(80),
    availability    VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME',
    linkedin_url    VARCHAR(500),
    portfolio_url   VARCHAR(500),
    avatar_url      VARCHAR(500),
    years_experience INT DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_availability (availability),
    INDEX idx_profiles_location (location),
    INDEX idx_profiles_timezone (timezone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profile_skills (
    profile_id BIGINT NOT NULL,
    skill      VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, skill),
    CONSTRAINT fk_skills_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_skills_skill (skill)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profile_interests (
    profile_id BIGINT NOT NULL,
    interest   VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, interest),
    CONSTRAINT fk_interests_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_interests_interest (interest)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE startup_ideas (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id        BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    domain          VARCHAR(100) NOT NULL,
    description     TEXT NOT NULL,
    stage           VARCHAR(30) NOT NULL DEFAULT 'IDEA',
    equity_offered  VARCHAR(100),
    role_expectations TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ideas_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ideas_domain (domain),
    INDEX idx_ideas_stage (stage),
    INDEX idx_ideas_owner (owner_id),
    INDEX idx_ideas_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE open_roles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    idea_id         BIGINT NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    skills_required JSON,
    filled          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_roles_idea FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE,
    INDEX idx_roles_idea (idea_id),
    INDEX idx_roles_filled (filled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE collaboration_requests (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id       BIGINT NOT NULL,
    recipient_id    BIGINT NOT NULL,
    idea_id         BIGINT,
    open_role_id    BIGINT,
    message         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_idea FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE SET NULL,
    CONSTRAINT fk_req_role FOREIGN KEY (open_role_id) REFERENCES open_roles(id) ON DELETE SET NULL,
    INDEX idx_req_sender (sender_id),
    INDEX idx_req_recipient (recipient_id),
    INDEX idx_req_status (status),
    INDEX idx_req_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    link            VARCHAR(500),
    read_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (read_flag),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookmarks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    bookmarked_user_id BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_target FOREIGN KEY (bookmarked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_bookmark (user_id, bookmarked_user_id),
    INDEX idx_bookmark_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE endorsements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    endorser_id     BIGINT NOT NULL,
    endorsed_id     BIGINT NOT NULL,
    skill           VARCHAR(100) NOT NULL,
    message         VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_endorse_endorser FOREIGN KEY (endorser_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_endorse_endorsed FOREIGN KEY (endorsed_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_endorsement (endorser_id, endorsed_id, skill),
    INDEX idx_endorse_endorsed (endorsed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conversations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id      BIGINT NOT NULL UNIQUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conv_request FOREIGN KEY (request_id) REFERENCES collaboration_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id       BIGINT NOT NULL,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_msg_conv (conversation_id),
    INDEX idx_msg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id     BIGINT NOT NULL,
    reported_user_id BIGINT,
    reported_idea_id BIGINT,
    reason          VARCHAR(50) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at     TIMESTAMP NULL,
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_report_idea FOREIGN KEY (reported_idea_id) REFERENCES startup_ideas(id) ON DELETE SET NULL,
    INDEX idx_report_status (status),
    INDEX idx_report_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blocks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    blocker_id      BIGINT NOT NULL,
    blocked_id      BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_block (blocker_id, blocked_id),
    INDEX idx_block_blocker (blocker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id        BIGINT NOT NULL,
    action          VARCHAR(100) NOT NULL,
    target_type     VARCHAR(50),
    target_id       BIGINT,
    details         JSON,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_admin (admin_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE token_blacklist (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_jti       VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    INDEX idx_blacklist_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
