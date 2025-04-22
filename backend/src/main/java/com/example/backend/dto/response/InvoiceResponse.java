package com.example.backend.dto.response;

import com.example.backend.model.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
	private String id;
	private String rescueRequestId;
	private String invoiceNumber;
	private Double amount;
	private LocalDateTime invoiceDate;
	private LocalDateTime dueDate;
	private LocalDateTime paidDate;
	private InvoiceStatus status;
	private String paymentMethod;
	private String notes;
	private LocalDateTime createdAt;
}