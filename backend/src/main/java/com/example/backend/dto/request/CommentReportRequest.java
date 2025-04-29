package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class CommentReportRequest {
	@NotNull(message = "Rating ID is required")
	private String ratingId;

	@NotBlank(message = "Reason is required")
	@Size(max = 500, message = "Reason must not exceed 500 characters")
	private String reason;
}