package com.example.backend.service;

import com.example.backend.dto.request.TopicCreateRequest;
import com.example.backend.dto.request.TopicCommentCreateRequest;
import com.example.backend.dto.response.TopicResponse;
import com.example.backend.dto.response.TopicCommentResponse;

import java.util.List;

public interface TopicService {
    TopicResponse createTopic(TopicCreateRequest request, String userId, String userName, String userAvatar);
    List<TopicResponse> getTopics(String category, String search);
    TopicResponse getTopicById(String id);
    void deleteTopic(String id, String userId, boolean isAdmin);

    TopicCommentResponse addComment(String topicId, TopicCommentCreateRequest request, String userId, String userName, String userAvatar);
    List<TopicCommentResponse> getComments(String topicId);
    void deleteComment(String topicId, String commentId, String userId, boolean isAdmin);
} 