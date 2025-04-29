package com.example.backend.repository;

import com.example.backend.model.CommentReport;
import com.example.backend.model.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentReportRepository extends JpaRepository<CommentReport, String> {
    List<CommentReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    
    List<CommentReport> findByRating_IdOrderByCreatedAtDesc(String ratingId);
}