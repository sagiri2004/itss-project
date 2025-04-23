package com.example.backend.dto.response;

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
@Schema(description = "Response object containing invoice details")
public class InvoiceResponse {

	@Schema(description = "Unique identifier of the invoice", example = "60f8a1e9-5c3d-4a2b-8f7d-9e1c3b2a1d9e")
	private String id;

	@Schema(description = "ID of the associated rescue request", example = "5f8d0f5c-1c7a-4b7c-9b4a-9d1c8a7e5d6c")
	private String rescueRequestId;

	@Schema(description = "Unique invoice number", example = "INV-20230715-0001")
	private String invoiceNumber;

	@Schema(description = "Total amount charged", example = "250000.0")
	private Double amount;

	@Schema(description = "Date when the invoice was created", example = "2023-07-15T14:30:00")
	private LocalDateTime invoiceDate;

	@Schema(description = "Due date for payment", example = "2023-07-22T23:59:59")
	private LocalDateTime dueDate;

	@Schema(description = "Date when the invoice was paid, if applicable", example = "2023-07-18T10:15:30")
	private LocalDateTime paidDate;

	@Schema(description = "Current status of the invoice", example = "PAID")
	private InvoiceStatus status;

	@Schema(description = "Method used for payment, if applicable", example = "Credit Card")
	private String paymentMethod;

	@Schema(description = "Additional notes about the invoice", example = "Payment for rescue and repair services")
	private String notes;

	@Schema(description = "Timestamp when the record was created", example = "2023-07-15T14:30:00")
	private LocalDateTime createdAt;
}