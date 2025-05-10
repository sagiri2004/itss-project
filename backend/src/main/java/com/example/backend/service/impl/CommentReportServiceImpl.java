package com.example.backend.service.impl;

import com.example.backend.dto.request.CommentReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.CommentReport;
import com.example.backend.model.CompanyRating;
import com.example.backend.model.User;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.model.enums.UserRole;
import com.example.backend.repository.CommentReportRepository;
import com.example.backend.repository.CompanyRatingRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CommentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentReportServiceImpl implements CommentReportService {
	private final CommentReportRepository reportRepository;
	private final CompanyRatingRepository ratingRepository;
	private final UserRepository userRepository;

	@Override
	@Transactional
	public CommentReport reportComment(CommentReportRequest request, String reporterId) {
		CompanyRating rating = ratingRepository.findById(request.getRatingId())
				.orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

		User reporter = userRepository.findById(reporterId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		CommentReport report = CommentReport.builder()
				.rating(rating)
				.reporter(reporter)
				.reason(request.getReason())
				.status(ReportStatus.PENDING)
				.build();

		return reportRepository.save(report);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CommentReport> getPendingReports() {
		return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
	}

	@Override
	@Transactional
	public CommentReport resolveReport(ResolveReportRequest request, String adminId) {
		User admin = userRepository.findById(adminId)
				.orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

		// Verify that the user is an admin
		if (!admin.getRoles().contains(UserRole.ADMIN)) {
			throw new IllegalArgumentException("Only admins can resolve reports");
		}

		CommentReport report = reportRepository.findById(request.getReportId())
				.orElseThrow(() -> new ResourceNotFoundException("Report not found"));

		report.setStatus(request.getStatus());
		report.setResolvedBy(admin);
		report.setResolutionNote(request.getResolutionNote());

		// If the report is approved, delete the rating
		if (request.getStatus() == ReportStatus.APPROVED) {
			ratingRepository.delete(report.getRating());
		}

		return reportRepository.save(report);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CommentReport> getReportsForRating(String ratingId) {
		return reportRepository.findByRating_IdOrderByCreatedAtDesc(ratingId);
	}
}