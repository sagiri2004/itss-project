package com.example.backend.model;

import com.example.backend.model.enums.ReportType;
import com.example.backend.model.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    private ReportType type;

    private String targetId; // ID của entity bị report (topicId, commentId, ...)

    private String reporterId; // userId của người report

    private String reason;

    @Enumerated(EnumType.STRING)
    private ReportStatus status; // PENDING, APPROVED, REJECTED

    private String resolutionNote;

    private String resolvedBy; // userId của admin xử lý

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 