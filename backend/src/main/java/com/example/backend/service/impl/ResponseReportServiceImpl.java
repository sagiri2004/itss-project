package com.example.backend.service.impl;

import com.example.backend.dto.request.ResponseReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.DiscussionResponse;
import com.example.backend.model.ResponseReport;
import com.example.backend.model.User;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.model.enums.UserRole;
import com.example.backend.repository.DiscussionResponseRepository;
import com.example.backend.repository.ResponseReportRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ResponseReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResponseReportServiceImpl implements ResponseReportService {
	private final ResponseReportRepository reportRepository;
	private final DiscussionResponseRepository responseRepository;
	private final UserRepository userRepository;

	@Override
	@Transactional
	public ResponseReport reportResponse(ResponseReportRequest request, String reporterId) {
		DiscussionResponse response = responseRepository.findById(request.getResponseId())
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		User reporter = userRepository.findById(reporterId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		// Kiểm tra xem người dùng đã báo cáo phản hồi này chưa
		if (reportRepository.existsByDiscussionResponseAndReporter_Id(response, reporterId)) {
			throw new IllegalArgumentException("You have already reported this response");
		}

		ResponseReport report = ResponseReport.builder()
				.discussionResponse(response)
				.reporter(reporter)
				.reason(request.getReason())
				.status(ReportStatus.PENDING)
				.build();

		return reportRepository.save(report);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ResponseReport> getPendingReports() {
		return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
	}

	@Override
	@Transactional
	public ResponseReport resolveReport(ResolveReportRequest request, String adminId) {
		User admin = userRepository.findById(adminId)
				.orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

		// Verify that the user is an admin
		if (!admin.getRoles().contains(UserRole.ADMIN)) {
			throw new IllegalArgumentException("Only admins can resolve reports");
		}

		ResponseReport report = reportRepository.findById(request.getReportId())
				.orElseThrow(() -> new ResourceNotFoundException("Report not found"));

		report.setStatus(request.getStatus());
		report.setResolvedBy(admin);
		report.setResolutionNote(request.getResolutionNote());

		// If the report is approved, delete the response
		if (request.getStatus() == ReportStatus.APPROVED) {
			responseRepository.delete(report.getDiscussionResponse());
		}

		return reportRepository.save(report);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ResponseReport> getReportsForResponse(String responseId) {
		return reportRepository.findByDiscussionResponse_IdOrderByCreatedAtDesc(responseId);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean hasUserReportedResponse(String responseId, String userId) {
		DiscussionResponse response = responseRepository.findById(responseId)
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		return reportRepository.existsByDiscussionResponseAndReporter_Id(response, userId);
	}
}