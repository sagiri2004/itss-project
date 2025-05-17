package com.example.backend.service.impl;

import com.example.backend.dto.request.TopicCreateRequest;
import com.example.backend.dto.request.TopicCommentCreateRequest;
import com.example.backend.dto.response.TopicResponse;
import com.example.backend.dto.response.TopicCommentResponse;
import com.example.backend.model.Topic;
import com.example.backend.model.TopicComment;
import com.example.backend.model.User;
import com.example.backend.repository.TopicRepository;
import com.example.backend.repository.TopicCommentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.KeywordRepository;
import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.exception.BadRequestException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;
    private final TopicCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final KeywordRepository keywordRepository;

    private void checkContentForKeywords(String content) {
        if (content == null) return;
        var keywords = keywordRepository.findAll();
        for (var keyword : keywords) {
            if (content.toLowerCase().contains(keyword.getWord().toLowerCase())) {
                throw new BadRequestException("Nội dung chứa từ khóa bị cấm: " + keyword.getWord());
            }
        }
    }

    @Override
    public TopicResponse createTopic(TopicCreateRequest request, String userId, String userName, String userAvatar) {
        checkContentForKeywords(request.getTitle());
        checkContentForKeywords(request.getContent());
        Topic topic = Topic.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .commentCount(0)
                .viewCount(0)
                .build();
        topic = topicRepository.save(topic);
        return toResponse(topic);
    }

    @Override
    public List<TopicResponse> getTopics(String category, String search) {
        List<Topic> topics;
        if (category != null && !category.isBlank() && search != null && !search.isBlank()) {
            topics = topicRepository.findByCategoryIgnoreCaseAndTitleContainingIgnoreCase(category, search);
        } else if (category != null && !category.isBlank()) {
            topics = topicRepository.findByCategoryIgnoreCase(category);
        } else if (search != null && !search.isBlank()) {
            topics = topicRepository.findByTitleContainingIgnoreCase(search);
        } else {
            topics = topicRepository.findAll();
        }
        return topics.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public TopicResponse getTopicById(String id) {
        Topic topic = topicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setViewCount(topic.getViewCount() + 1);
        topicRepository.save(topic);
        return toResponse(topic);
    }

    @Override
    @Transactional
    public void deleteTopic(String id, String userId, boolean isAdmin) {
        Topic topic = topicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found"));
        if (!isAdmin && !topic.getUserId().equals(userId)) {
            throw new RuntimeException("No permission to delete this topic");
        }
        commentRepository.deleteAll(commentRepository.findByTopicIdOrderByCreatedAtAsc(id));
        topicRepository.delete(topic);
    }

    @Override
    public TopicCommentResponse addComment(String topicId, TopicCommentCreateRequest request, String userId, String userName, String userAvatar) {
        checkContentForKeywords(request.getContent());
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new RuntimeException("Topic not found"));
        TopicComment comment = TopicComment.builder()
                .content(request.getContent())
                .userId(userId)
                .topicId(topicId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        comment = commentRepository.save(comment);
        topic.setCommentCount(topic.getCommentCount() + 1);
        topicRepository.save(topic);
        return toCommentResponse(comment);
    }

    @Override
    public List<TopicCommentResponse> getComments(String topicId) {
        return commentRepository.findByTopicIdOrderByCreatedAtAsc(topicId)
                .stream().map(this::toCommentResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(String topicId, String commentId, String userId, boolean isAdmin) {
        TopicComment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!isAdmin && !comment.getUserId().equals(userId)) {
            throw new RuntimeException("No permission to delete this comment");
        }
        commentRepository.delete(comment);
        Topic topic = topicRepository.findById(topicId).orElse(null);
        if (topic != null && topic.getCommentCount() > 0) {
            topic.setCommentCount(topic.getCommentCount() - 1);
            topicRepository.save(topic);
        }
    }

    private TopicResponse toResponse(Topic topic) {
        TopicResponse res = new TopicResponse();
        res.setId(topic.getId());
        res.setTitle(topic.getTitle());
        res.setContent(topic.getContent());
        res.setCategory(topic.getCategory());
        res.setImageUrl(topic.getImageUrl());
        res.setUserId(topic.getUserId());
        User user = userRepository.findById(topic.getUserId()).orElse(null);
        res.setUserName(user != null ? user.getName() : "");
        res.setUserAvatar(user != null ? null : null);
        res.setCreatedAt(topic.getCreatedAt());
        res.setUpdatedAt(topic.getUpdatedAt());
        res.setCommentCount(topic.getCommentCount());
        res.setViewCount(topic.getViewCount());
        return res;
    }

    private TopicCommentResponse toCommentResponse(TopicComment comment) {
        TopicCommentResponse res = new TopicCommentResponse();
        res.setId(comment.getId());
        res.setContent(comment.getContent());
        res.setUserId(comment.getUserId());
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        res.setUserName(user != null ? user.getName() : "");
        res.setUserAvatar(user != null ? null : null);
        res.setTopicId(comment.getTopicId());
        res.setCreatedAt(comment.getCreatedAt());
        res.setUpdatedAt(comment.getUpdatedAt());
        return res;
    }
} 