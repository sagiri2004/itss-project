package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRatingResponse {
    private String id;
    private String companyId;
    private String companyName;
    private String serviceId;
    private String serviceName;
    private String userId;
    private String userName;
    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}