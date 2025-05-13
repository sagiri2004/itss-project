package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRatingSummary {
    private String companyId;
    private String companyName;
    private Double averageRating;
    private Long totalRatings;
    private Map<Integer, Long> starDistribution; // Key: stars (1-5), Value: count
}