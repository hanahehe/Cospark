package com.cospark.repository;

import com.cospark.domain.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Page<Bookmark> findByUserId(Long userId, Pageable pageable);

    Optional<Bookmark> findByUserIdAndBookmarkedUserId(Long userId, Long bookmarkedUserId);

    boolean existsByUserIdAndBookmarkedUserId(Long userId, Long bookmarkedUserId);

    void deleteByUserIdAndBookmarkedUserId(Long userId, Long bookmarkedUserId);
}
