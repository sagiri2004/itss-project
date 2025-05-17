package com.example.backend.dto.request;

import lombok.Data;

@Data
public class TopicCreateRequest {
    private String title;
    private String content;
    private String category;
    private String imageUrl;
} 