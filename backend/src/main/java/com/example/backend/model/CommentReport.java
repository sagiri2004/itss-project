package com.example.backend.model;

import com.example.backend.model.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentReport {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "rating_id", nullable = false)
	CompanyRating rating;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_id", nullable = false)
	User reporter;

	@Column(nullable = false)
	String reason;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	ReportStatus status;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "resolved_by")
	User resolvedBy;

	@Column
	String resolutionNote;

	@CreationTimestamp
	LocalDateTime createdAt;

	@UpdateTimestamp
	LocalDateTime updatedAt;
}