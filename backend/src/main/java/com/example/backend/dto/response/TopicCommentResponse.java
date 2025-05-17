package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TopicCommentResponse {
    private String id;
    private String content;
    private String userId;
    private String userName;
    private String userAvatar;
    private String topicId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 