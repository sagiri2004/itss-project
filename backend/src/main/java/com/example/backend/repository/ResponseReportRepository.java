package com.example.backend.repository;

import com.example.backend.model.DiscussionResponse;
import com.example.backend.model.ResponseReport;
import com.example.backend.model.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseReportRepository extends JpaRepository<ResponseReport, String> {
	List<ResponseReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);

	List<ResponseReport> findByDiscussionResponse_IdOrderByCreatedAtDesc(String responseId);

	boolean existsByDiscussionResponseAndReporter_Id(DiscussionResponse response, String reporterId);
}