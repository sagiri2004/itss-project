package com.example.backend.controller;

import com.example.backend.dto.response.*;
import com.example.backend.model.*;
import com.example.backend.service.AdminService;
import com.example.backend.model.enums.ReportType;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.dto.request.ResolveReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() { return ResponseEntity.ok(adminService.getAllUsers()); }
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) { return ResponseEntity.ok(adminService.getUserById(id)); }
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody User user) { return ResponseEntity.ok(adminService.updateUser(id, user)); }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) { adminService.deleteUser(id); return ResponseEntity.noContent().build(); }
    // Company management
    @GetMapping("/companies")
    public ResponseEntity<List<RescueCompanyResponse>> getCompanies() {
        return ResponseEntity.ok(adminService.getAllCompanies());
    }
    @GetMapping("/companies/{id}")
    public ResponseEntity<RescueCompany> getCompanyById(@PathVariable String id) { return ResponseEntity.ok(adminService.getCompanyById(id)); }
    @PutMapping("/companies/{id}")
    public ResponseEntity<RescueCompany> updateCompany(@PathVariable String id, @RequestBody RescueCompany company) { return ResponseEntity.ok(adminService.updateCompany(id, company)); }
    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) { adminService.deleteCompany(id); return ResponseEntity.noContent().build(); }
    // Invoice management
    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> getInvoices() { return ResponseEntity.ok(adminService.getAllInvoices()); }
    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable String id) { return ResponseEntity.ok(adminService.getInvoiceById(id)); }
    @PutMapping("/invoices/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable String id, @RequestBody Invoice invoice) { return ResponseEntity.ok(adminService.updateInvoice(id, invoice)); }
    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String id) { adminService.deleteInvoice(id); return ResponseEntity.noContent().build(); }
    // Request management
    @GetMapping("/requests")
    public ResponseEntity<List<RescueRequestResponse>> getRequests() { return ResponseEntity.ok(adminService.getAllRequests()); }
    @GetMapping("/requests/{id}")
    public ResponseEntity<RescueRequest> getRequestById(@PathVariable String id) { return ResponseEntity.ok(adminService.getRequestById(id)); }
    @PutMapping("/requests/{id}")
    public ResponseEntity<RescueRequest> updateRequest(@PathVariable String id, @RequestBody RescueRequest req) { return ResponseEntity.ok(adminService.updateRequest(id, req)); }
    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable String id) { adminService.deleteRequest(id); return ResponseEntity.noContent().build(); }
    // Rating management (thay cho review)
    @GetMapping("/ratings")
    public ResponseEntity<List<CompanyRatingResponse>> getRatings() { return ResponseEntity.ok(adminService.getAllRatings()); }
    @DeleteMapping("/ratings/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable String id) { adminService.deleteRating(id); return ResponseEntity.noContent().build(); }
    // Keyword management
    @GetMapping("/keywords")
    public ResponseEntity<List<Keyword>> getKeywords() { return ResponseEntity.ok(adminService.getAllKeywords()); }
    @PostMapping("/keywords")
    public ResponseEntity<Keyword> addKeyword(@RequestBody Keyword keyword) { return ResponseEntity.ok(adminService.addKeyword(keyword)); }
    @DeleteMapping("/keywords/{id}")
    public ResponseEntity<Void> deleteKeyword(@PathVariable String id) { adminService.deleteKeyword(id); return ResponseEntity.noContent().build(); }
    // Dashboard stats (dummy)
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Object> getDashboardStats() { return ResponseEntity.ok(new Object()); }
    // Topic reports
    @GetMapping("/topic-reports")
    public ResponseEntity<List<Report>> getTopicReports(@RequestParam(required = false) ReportStatus status) {
        return ResponseEntity.ok(adminService.getTopicReports(status));
    }
    @DeleteMapping("/topic-reports/{id}")
    public ResponseEntity<Void> deleteTopicReport(@PathVariable String id) {
        adminService.deleteTopicReport(id);
        return ResponseEntity.noContent().build();
    }
    // Comment reports
    @GetMapping("/comment-reports")
    public ResponseEntity<List<Report>> getCommentReports(@RequestParam(required = false) ReportStatus status) {
        return ResponseEntity.ok(adminService.getCommentReports(status));
    }
    @DeleteMapping("/comment-reports/{id}")
    public ResponseEntity<Void> deleteCommentReport(@PathVariable String id) {
        adminService.deleteCommentReport(id);
        return ResponseEntity.noContent().build();
    }
    // Generic admin reports
    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getReports(@RequestParam(required = false) ReportType type, @RequestParam(required = false) ReportStatus status) {
        return ResponseEntity.ok(adminService.getReports(type, status));
    }
    @PostMapping("/reports/resolve")
    public ResponseEntity<Report> resolveReport(@RequestBody ResolveReportRequest request) {
        return ResponseEntity.ok(adminService.resolveReport(request, "admin"));
    }
    @GetMapping("/reports/top")
    public ResponseEntity<List<Object[]>> getTopReported(@RequestParam ReportType type, @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getTopReported(type, limit));
    }
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        adminService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
    // Keyword filter endpoints
    @GetMapping("/filter/topics")
    public ResponseEntity<List<Topic>> filterTopicsByKeyword(@RequestParam String keyword) { return ResponseEntity.ok(adminService.findTopicsByKeyword(keyword)); }
    @GetMapping("/filter/comments")
    public ResponseEntity<List<TopicComment>> filterCommentsByKeyword(@RequestParam String keyword) { return ResponseEntity.ok(adminService.findCommentsByKeyword(keyword)); }
    @GetMapping("/filter/ratings")
    public ResponseEntity<List<CompanyRatingResponse>> filterRatingsByKeyword(@RequestParam String keyword) { return ResponseEntity.ok(adminService.findRatingsByKeyword(keyword)); }
    @GetMapping("/vehicles")
    public ResponseEntity<List<RescueVehicleResponse>> getVehicles() {
        return ResponseEntity.ok(adminService.getAllVehicles());
    }
    @GetMapping("/vehicles/{id}")
    public ResponseEntity<RescueVehicleResponse> getVehicleById(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getVehicleById(id));
    }
    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id) {
        adminService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
    // Statistics endpoints
    @GetMapping("/report/request-stats")
    public ResponseEntity<Map<String, Object>> getRequestStats(
        @RequestParam(defaultValue = "month") String timeRange,
        @RequestParam(defaultValue = "false") boolean groupByStatus
    ) {
        return ResponseEntity.ok(adminService.getRequestStats(timeRange, groupByStatus));
    }

    @GetMapping("/report/service-usage-stats")
    public ResponseEntity<Map<String, Object>> getServiceUsageStats(
        @RequestParam(defaultValue = "month") String timeRange
    ) {
        return ResponseEntity.ok(adminService.getServiceUsageStats(timeRange));
    }

    @GetMapping("/report/satisfaction-stats")
    public ResponseEntity<Map<String, Object>> getSatisfactionStats(
        @RequestParam(defaultValue = "month") String timeRange
    ) {
        return ResponseEntity.ok(adminService.getSatisfactionStats(timeRange));
    }

    @GetMapping("/report/top-rated-services")
    public ResponseEntity<Map<String, Object>> getTopRatedServices(
        @RequestParam(defaultValue = "month") String timeRange
    ) {
        return ResponseEntity.ok(adminService.getTopRatedServices(timeRange));
    }

    @GetMapping("/online-users")
    public ResponseEntity<List<String>> getOnlineUsers() {
        return ResponseEntity.ok(adminService.getOnlineUsers());
    }

    // Service deletion requests
    @GetMapping("/service-deletion-requests")
    public ResponseEntity<List<RescueServiceDeletionResponse>> getServiceDeletionRequests() {
        return ResponseEntity.ok(adminService.getServiceDeletionRequests());
    }

    @GetMapping("/service-deletion-requests/{id}")
    public ResponseEntity<RescueServiceDeletionResponse> getServiceDeletionRequestById(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getServiceDeletionRequestById(id));
    }

    @PostMapping("/service-deletion-requests/{id}/approve")
    public ResponseEntity<RescueServiceDeletionResponse> approveServiceDeletion(
            @PathVariable String id) {
        return ResponseEntity.ok(adminService.approveServiceDeletion(id));
    }

    @PostMapping("/service-deletion-requests/{id}/reject")
    public ResponseEntity<RescueServiceDeletionResponse> rejectServiceDeletion(
            @PathVariable String id,
            @RequestParam String reason) {
        return ResponseEntity.ok(adminService.rejectServiceDeletion(id, reason));
    }
} 