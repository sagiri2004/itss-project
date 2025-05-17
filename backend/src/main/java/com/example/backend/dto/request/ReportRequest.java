package com.example.backend.dto.request;

import com.example.backend.model.enums.ReportType;
import lombok.Data;

@Data
public class ReportRequest {
    private ReportType type;
    private String targetId;
    private String reason;
} 