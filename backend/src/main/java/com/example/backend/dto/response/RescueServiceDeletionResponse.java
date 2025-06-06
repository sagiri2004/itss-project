package com.example.backend.dto.response;

import com.example.backend.model.RescueServiceDeletionRequest.Status;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class RescueServiceDeletionResponse {
    private String id;
    private String serviceId;
    private String serviceName;
    private String companyId;
    private String companyName;
    private String reason;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}