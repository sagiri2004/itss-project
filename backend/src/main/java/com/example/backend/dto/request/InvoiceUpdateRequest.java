package com.example.backend.dto.request;

import com.example.backend.model.enums.InvoiceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for updating an existing invoice")
public class InvoiceUpdateRequest {

	@Schema(description = "Updated total amount", example = "275000.0")
	private Double amount;

	@Schema(description = "Updated due date for payment", example = "2024-01-15T23:59:59")
	private LocalDateTime dueDate;

	@Schema(description = "Updated invoice status", example = "PAID")
	private InvoiceStatus status;

	@Schema(description = "Payment method used", example = "Credit Card")
	private String paymentMethod;

	@Schema(description = "Updated additional notes", example = "Payment received via credit card")
	private String notes;
}