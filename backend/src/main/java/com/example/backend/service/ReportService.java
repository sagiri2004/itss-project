package com.example.backend.service;

import com.example.backend.dto.request.ReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.Report;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.model.enums.ReportType;

import java.util.List;

public interface ReportService {
    Report createReport(ReportRequest request, String reporterId);
    List<Report> getReports(ReportType type, ReportStatus status);
    Report resolveReport(ResolveReportRequest request, String adminId);
    List<Object[]> getTopReported(ReportType type, int limit);
    void deleteReport(String id);
} 