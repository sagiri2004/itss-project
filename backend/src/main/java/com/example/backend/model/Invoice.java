package com.example.backend.model;

import com.example.backend.model.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	@ManyToOne
	@JoinColumn(name = "rescue_request_id", nullable = false)
	private RescueRequest rescueRequest;

	@Column(nullable = false)
	private Double amount;

	@Column(name = "invoice_number", nullable = false, unique = true)
	private String invoiceNumber;

	@Column(name = "invoice_date", nullable = false)
	private LocalDateTime invoiceDate;

	@Column(name = "due_date", nullable = false)
	private LocalDateTime dueDate;

	@Column(name = "paid_date")
	private LocalDateTime paidDate;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private InvoiceStatus status;

	@Column(name = "payment_method")
	private String paymentMethod;

	@Column
	private String notes;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
}