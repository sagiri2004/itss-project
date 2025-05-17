package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String userId;
    private String topicId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 