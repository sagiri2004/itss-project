package com.example.backend.service;

import com.example.backend.dto.request.CommentReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.CommentReport;

import java.util.List;

/**
 * Service interface for managing comment reports.
 * Provides methods for reporting, reviewing, and resolving reported comments.
 */
public interface CommentReportService {
    /**
     * Report a comment for review.
     *
     * @param request CommentReportRequest containing rating ID and reason for report
     * @param reporterId ID of the user submitting the report
     * @return The created CommentReport
     */
    CommentReport reportComment(CommentReportRequest request, String reporterId);
    
    /**
     * Get all pending reports that need review.
     *
     * @return List of CommentReport objects with pending status
     */
    List<CommentReport> getPendingReports();
    
    /**
     * Resolve a report by approving or rejecting it.
     * Only admin users can resolve reports.
     *
     * @param request ResolveReportRequest containing resolution details
     * @param adminId ID of the admin resolving the report
     * @return The updated CommentReport
     */
    CommentReport resolveReport(ResolveReportRequest request, String adminId);
    
    /**
     * Get all reports for a specific rating.
     *
     * @param ratingId ID of the rating
     * @return List of CommentReport objects for the rating
     */
    List<CommentReport> getReportsForRating(String ratingId);
}