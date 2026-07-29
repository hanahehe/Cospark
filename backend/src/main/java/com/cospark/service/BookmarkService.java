package com.cospark.service;

import com.cospark.domain.entity.Bookmark;
import com.cospark.domain.entity.User;
import com.cospark.dto.response.PageResponse;
import com.cospark.dto.response.ProfileResponse;
import com.cospark.exception.ApiException;
import com.cospark.mapper.EntityMapper;
import com.cospark.repository.BookmarkRepository;
import com.cospark.repository.ProfileRepository;
import com.cospark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EntityMapper mapper;

    @Transactional
    public void toggleBookmark(Long userId, Long targetUserId) {
        if (userId.equals(targetUserId)) {
            throw new ApiException("Cannot bookmark yourself", HttpStatus.BAD_REQUEST);
        }
        var existing = bookmarkRepository.findByUserIdAndBookmarkedUserId(userId, targetUserId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            User target = userRepository.findById(targetUserId).orElseThrow();
            bookmarkRepository.save(Bookmark.builder().user(user).bookmarkedUser(target).build());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ProfileResponse> getBookmarks(Long userId, int page, int size) {
        var bookmarks = bookmarkRepository.findByUserId(userId, PageRequest.of(page, size));
        return mapper.toPageResponse(bookmarks.map(b -> {
            var profile = profileRepository.findByUserId(b.getBookmarkedUser().getId()).orElseThrow();
            return mapper.toProfileResponse(profile, true, List.of());
        }));
    }
}
