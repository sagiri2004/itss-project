package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkResponseHelpfulRequest {
	@NotNull(message = "Response ID is required")
	private String responseId;

	@NotNull(message = "Helpful status is required")
	private Boolean isHelpful;
}