package com.example.backend.controller;

import com.example.backend.dto.request.ReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.Report;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.model.enums.ReportType;
import com.example.backend.service.ReportService;
import com.example.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody ReportRequest request, @RequestHeader("Authorization") String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String userId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(reportService.createReport(request, userId));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports(
            @RequestParam(required = false) ReportType type,
            @RequestParam(required = false) ReportStatus status
    ) {
        return ResponseEntity.ok(reportService.getReports(type, status));
    }

    @PostMapping("/resolve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Report> resolveReport(@RequestBody ResolveReportRequest request, @RequestHeader("Authorization") String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String adminId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(reportService.resolveReport(request, adminId));
    }

    @GetMapping("/top")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Object[]>> getTopReported(
            @RequestParam ReportType type,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(reportService.getTopReported(type, limit));
    }
} 