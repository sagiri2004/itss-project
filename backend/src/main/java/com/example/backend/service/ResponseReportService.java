package com.example.backend.service;

import com.example.backend.dto.request.ResponseReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.ResponseReport;

import java.util.List;

/**
 * Service interface for managing response reports in community discussions.
 */
public interface ResponseReportService {
	/**
	 * Report a response for review.
	 *
	 * @param request ResponseReportRequest containing response ID and reason for report
	 * @param reporterId ID of the user submitting the report
	 * @return The created ResponseReport
	 */
	ResponseReport reportResponse(ResponseReportRequest request, String reporterId);

	/**
	 * Get all pending reports that need review.
	 *
	 * @return List of ResponseReport objects with pending status
	 */
	List<ResponseReport> getPendingReports();

	/**
	 * Resolve a report by approving or rejecting it.
	 * Only admin users can resolve reports.
	 *
	 * @param request ResolveReportRequest containing resolution details
	 * @param adminId ID of the admin resolving the report
	 * @return The updated ResponseReport
	 */
	ResponseReport resolveReport(ResolveReportRequest request, String adminId);

	/**
	 * Get all reports for a specific response.
	 *
	 * @param responseId ID of the response
	 * @return List of ResponseReport objects for the response
	 */
	List<ResponseReport> getReportsForResponse(String responseId);

	/**
	 * Check if a user has already reported a specific response.
	 *
	 * @param responseId ID of the response
	 * @param userId ID of the user
	 * @return true if the user has already reported the response, false otherwise
	 */
	boolean hasUserReportedResponse(String responseId, String userId);
}