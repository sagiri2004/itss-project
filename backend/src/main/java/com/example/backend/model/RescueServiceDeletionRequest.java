package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_service_deletion_requests")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescueServiceDeletionRequest {
    @Id
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    RescueService service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    RescueCompany company;

    String reason;

    @Enumerated(EnumType.STRING)
    Status status;

    LocalDateTime createdAt;
    LocalDateTime processedAt;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
} 