package com.example.backend.service.impl;

import com.example.backend.dto.request.ReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.Report;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.model.enums.ReportType;
import com.example.backend.repository.ReportRepository;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ReportRepository reportRepository;

    @Override
    public Report createReport(ReportRequest request, String reporterId) {
        Report report = Report.builder()
                .type(request.getType())
                .targetId(request.getTargetId())
                .reporterId(reporterId)
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .build();
        return reportRepository.save(report);
    }

    @Override
    public List<Report> getReports(ReportType type, ReportStatus status) {
        if (type != null && status != null) {
            return reportRepository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            return reportRepository.findByType(type);
        } else if (status != null) {
            return reportRepository.findByStatus(status);
        } else {
            return reportRepository.findAll();
        }
    }

    @Override
    @Transactional
    public Report resolveReport(ResolveReportRequest request, String adminId) {
        Report report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(request.getStatus());
        report.setResolutionNote(request.getResolutionNote());
        report.setResolvedBy(adminId);
        return reportRepository.save(report);
    }

    @Override
    public List<Object[]> getTopReported(ReportType type, int limit) {
        List<Object[]> all = reportRepository.findTopReportedByType(type);
        return all.stream().limit(limit).collect(Collectors.toList());
    }

    @Override
    public void deleteReport(String id) {
        reportRepository.deleteById(id);
    }
} 