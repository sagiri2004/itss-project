package com.example.backend.service;

import com.example.backend.model.*;
import java.util.List;
import java.util.Map;
import com.example.backend.model.enums.ReportType;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.CompanyRating;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.RescueVehicleResponse;
import com.example.backend.dto.response.RescueServiceDeletionResponse;

public interface AdminService {
    // User
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    UserResponse updateUser(String id, User user);
    void deleteUser(String id);
    // Company
    List<com.example.backend.dto.response.RescueCompanyResponse> getAllCompanies();
    RescueCompany getCompanyById(String id);
    RescueCompany updateCompany(String id, RescueCompany company);
    void deleteCompany(String id);
    // Invoice
    List<InvoiceResponse> getAllInvoices();
    Invoice getInvoiceById(String id);
    Invoice updateInvoice(String id, Invoice invoice);
    void deleteInvoice(String id);
    // Request
    List<RescueRequestResponse> getAllRequests();
    RescueRequest getRequestById(String id);
    RescueRequest updateRequest(String id, RescueRequest req);
    void deleteRequest(String id);
    // Keyword
    List<Keyword> getAllKeywords();
    Keyword addKeyword(Keyword keyword);
    void deleteKeyword(String id);
    // Report (topic, comment, generic)
    List<Report> getTopicReports(ReportStatus status);
    void deleteTopicReport(String id);
    List<Report> getCommentReports(ReportStatus status);
    void deleteCommentReport(String id);
    List<Report> getReports(ReportType type, ReportStatus status);
    Report resolveReport(ResolveReportRequest request, String adminId);
    List<Object[]> getTopReported(ReportType type, int limit);
    void deleteReport(String id);
    // Rating (thay cho review)
    List<CompanyRatingResponse> getAllRatings();
    void deleteRating(String id);
    // Keyword filter
    List<Topic> findTopicsByKeyword(String keyword);
    List<TopicComment> findCommentsByKeyword(String keyword);
    List<CompanyRatingResponse> findRatingsByKeyword(String keyword);
    // Vehicle
    List<RescueVehicleResponse> getAllVehicles();
    RescueVehicleResponse getVehicleById(String id);
    void deleteVehicle(String id);
    // Statistics endpoints
    Map<String, Object> getRequestStats(String timeRange, boolean groupByStatus);
    Map<String, Object> getServiceUsageStats(String timeRange);
    Map<String, Object> getSatisfactionStats(String timeRange);
    Map<String, Object> getTopRatedServices(String timeRange);
    // Online users
    List<String> getOnlineUsers();
    // Service deletion requests
    List<RescueServiceDeletionResponse> getServiceDeletionRequests();
    RescueServiceDeletionResponse getServiceDeletionRequestById(String id);
    RescueServiceDeletionResponse approveServiceDeletion(String requestId);
    RescueServiceDeletionResponse rejectServiceDeletion(String requestId, String reason);
} 