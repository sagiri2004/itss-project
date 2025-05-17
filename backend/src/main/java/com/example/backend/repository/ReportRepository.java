package com.example.backend.repository;

import com.example.backend.model.Report;
import com.example.backend.model.enums.ReportType;
import com.example.backend.model.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByType(ReportType type);
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByTypeAndStatus(ReportType type, ReportStatus status);
    List<Report> findByTargetIdAndType(String targetId, ReportType type);
    long countByTargetIdAndType(String targetId, ReportType type);

    @Query("SELECT r.targetId, COUNT(r) as cnt FROM Report r WHERE r.type = :type GROUP BY r.targetId ORDER BY cnt DESC")
    List<Object[]> findTopReportedByType(ReportType type);
} 