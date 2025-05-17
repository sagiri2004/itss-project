package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TopicResponse {
    private String id;
    private String title;
    private String content;
    private String category;
    private String imageUrl;
    private String userId;
    private String userName;
    private String userAvatar;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int commentCount;
    private int viewCount;
} 