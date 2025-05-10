package com.example.backend.dto.request;

import com.example.backend.model.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveReportRequest {
	@NotNull(message = "Report ID is required")
	private String reportId;

	@NotNull(message = "Status is required")
	private ReportStatus status;

	@Size(max = 500, message = "Resolution note must not exceed 500 characters")
	private String resolutionNote;
}