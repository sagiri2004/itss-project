package com.example.backend.service.impl;

import com.example.backend.dto.request.InvoiceCreateRequest;
import com.example.backend.dto.request.InvoiceUpdateRequest;
import com.example.backend.dto.request.UserConfirmPaymentRequest;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.event.NotificationEvent;
import com.example.backend.event.enums.NotificationType;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.kafka.NotificationEventProducer;
import com.example.backend.model.Invoice;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueRequest;
import com.example.backend.model.enums.InvoiceStatus;
import com.example.backend.model.enums.RescueRequestStatus;
import com.example.backend.repository.InvoiceRepository;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.RescueRequestRepository;
import com.example.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the InvoiceService interface.
 * Provides business logic for managing invoices in the system.
 */
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

	private final InvoiceRepository invoiceRepository;
	private final RescueRequestRepository rescueRequestRepository;
	private final RescueCompanyRepository rescueCompanyRepository;
	private final NotificationEventProducer notificationEventProducer;
	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<InvoiceResponse> getAllInvoices() {
		List<Invoice> invoices = invoiceRepository.findAll();
		return invoices.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse getInvoiceById(String id) {
		Invoice invoice = invoiceRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
		return toResponse(invoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse getInvoiceByRescueRequest(String rescueRequestId) {
		RescueRequest rescueRequest = rescueRequestRepository.findById(rescueRequestId)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + rescueRequestId));

		Invoice invoice = invoiceRepository.findByRescueRequest(rescueRequest)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found for rescue request with id: " + rescueRequestId));

		return toResponse(invoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse getInvoiceByInvoiceNumber(String invoiceNumber) {
		Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with invoice number: " + invoiceNumber));

		return toResponse(invoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<InvoiceResponse> getInvoicesByUserId(String userId) {
		// Find all rescue requests for this user
		List<RescueRequest> userRequests = rescueRequestRepository.findByUserId(userId);

		if (userRequests.isEmpty()) {
			return new ArrayList<>();
		}

		// Find all invoices for these rescue requests
		List<Invoice> invoices = invoiceRepository.findByRescueRequestIn(userRequests);

		return invoices.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<InvoiceResponse> getInvoicesByCompanyId(String companyId) {
		// Find all rescue requests for this company
		List<RescueRequest> companyRequests = rescueRequestRepository.findByCompanyId(companyId);

		if (companyRequests.isEmpty()) {
			return new ArrayList<>();
		}

		// Find all invoices for these rescue requests
		List<Invoice> invoices = invoiceRepository.findByRescueRequestIn(companyRequests);

		return invoices.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<InvoiceResponse> getInvoicesByCompanyManagerId(String userId) {
		// Find the company managed by this user
		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			return new ArrayList<>();
		}

		RescueCompany company = companies.get(0);

		// Find all rescue requests for this company
		List<RescueRequest> companyRequests = rescueRequestRepository.findByCompanyId(company.getId());

		if (companyRequests.isEmpty()) {
			return new ArrayList<>();
		}

		// Find all invoices for these rescue requests
		List<Invoice> invoices = invoiceRepository.findByRescueRequestIn(companyRequests);

		return invoices.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
		List<Invoice> invoices = invoiceRepository.findByStatus(status);

		return invoices.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
		// Find the rescue request
		RescueRequest rescueRequest = rescueRequestRepository.findById(request.getRescueRequestId())
				.orElseThrow(() -> new ResourceNotFoundException("Rescue request not found with id: " + request.getRescueRequestId()));

		// Check if invoice already exists for this rescue request
		if (invoiceRepository.existsByRescueRequest(rescueRequest)) {
			throw new IllegalStateException("An invoice already exists for this rescue request");
		}

		// Generate a unique invoice number with format INV-YYYYMMDD-XXXX
		LocalDateTime now = LocalDateTime.now();
		String dateStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String invoiceNumber = "INV-" + dateStr + "-" + String.format("%04d", getNextInvoiceSequence());

		// Create new invoice
		Invoice invoice = Invoice.builder()
				.rescueRequest(rescueRequest)
				.amount(request.getAmount())
				.invoiceNumber(invoiceNumber)
				.invoiceDate(now)
				.dueDate(request.getDueDate() != null ? request.getDueDate() : now.plusDays(7))
				.status(InvoiceStatus.PENDING)
				.notes(request.getNotes())
				.build();

		// Save invoice to database
		Invoice savedInvoice = invoiceRepository.save(invoice);

		// Update rescue request status to INVOICED
		rescueRequest.setStatus(RescueRequestStatus.INVOICED);
		rescueRequestRepository.save(rescueRequest);

		// Send notification to the user about the new invoice
		notificationEventProducer.sendNotificationEvent(NotificationEvent.builder()
				.recipientId(rescueRequest.getUser().getId())
				.title("Hóa đơn mới")
				.content("Một hóa đơn mới đã được tạo cho dịch vụ cứu hộ của bạn. Vui lòng kiểm tra và thanh toán.")
				.type(NotificationType.INVOICE_CREATED)
				.sentAt(LocalDateTime.now())
				.build());

		return toResponse(savedInvoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse updateInvoice(String id, InvoiceUpdateRequest request) {
		// Find the invoice
		Invoice invoice = invoiceRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

		// Update fields if provided
		if (request.getAmount() != null) {
			invoice.setAmount(request.getAmount());
		}

		if (request.getDueDate() != null) {
			invoice.setDueDate(request.getDueDate());
		}

		if (request.getStatus() != null) {
			invoice.setStatus(request.getStatus());

			// Special handling for PAID status
			if (request.getStatus() == InvoiceStatus.PAID && invoice.getPaidDate() == null) {
				invoice.setPaidDate(LocalDateTime.now());

				// Update rescue request status to PAID
				RescueRequest rescueRequest = invoice.getRescueRequest();
				rescueRequest.setStatus(RescueRequestStatus.PAID);
				rescueRequestRepository.save(rescueRequest);

				// Send notification about payment
				notificationEventProducer.sendNotificationEvent(NotificationEvent.builder()
						.recipientId(rescueRequest.getUser().getId())
						.title("Hóa đơn đã được thanh toán")
						.content("Hóa đơn của bạn đã được đánh dấu là đã thanh toán. Cảm ơn bạn đã sử dụng dịch vụ.")
						.type(NotificationType.INVOICE_PAID)
						.sentAt(LocalDateTime.now())
						.build());
			}
		}

		if (request.getPaymentMethod() != null) {
			invoice.setPaymentMethod(request.getPaymentMethod());
		}

		if (request.getNotes() != null) {
			invoice.setNotes(request.getNotes());
		}

		// Save updated invoice
		Invoice updatedInvoice = invoiceRepository.save(invoice);
		return toResponse(updatedInvoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse markInvoiceAsPaid(String id, String paymentMethod) {
		// Find the invoice
		Invoice invoice = invoiceRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

		// Check if already paid
		if (invoice.getStatus() == InvoiceStatus.PAID) {
			throw new IllegalStateException("Invoice is already marked as paid");
		}

		// Update invoice status and payment date
		invoice.setStatus(InvoiceStatus.PAID);
		invoice.setPaidDate(LocalDateTime.now());

		// Set payment method if provided
		if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
			invoice.setPaymentMethod(paymentMethod);
		}

		// Update rescue request status to PAID
		RescueRequest rescueRequest = invoice.getRescueRequest();
		rescueRequest.setStatus(RescueRequestStatus.PAID);
		rescueRequestRepository.save(rescueRequest);

		// Send notification about payment
		notificationEventProducer.sendNotificationEvent(NotificationEvent.builder()
				.recipientId(rescueRequest.getUser().getId())
				.title("Hóa đơn đã được thanh toán")
				.content("Hóa đơn của bạn đã được đánh dấu là đã thanh toán. Cảm ơn bạn đã sử dụng dịch vụ.")
				.type(NotificationType.INVOICE_PAID)
				.sentAt(LocalDateTime.now())
				.build());

		// Save updated invoice
		Invoice updatedInvoice = invoiceRepository.save(invoice);
		return toResponse(updatedInvoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public InvoiceResponse confirmPayment(String id, String userId, UserConfirmPaymentRequest request) {
		logger.info("Confirming payment for invoice id: {}, by user id: {}", id, userId);
		// Find the invoice
		Invoice invoice = invoiceRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

		// Check if invoice is already paid
		if (invoice.getStatus() == InvoiceStatus.PAID) {
			throw new IllegalStateException("Invoice is already marked as paid");
		}

		// Verify that the user is authorized to pay this invoice
		RescueRequest rescueRequest = invoice.getRescueRequest();
		if (!rescueRequest.getUser().getId().equals(userId)) {
			throw new AccessDeniedException("User is not authorized to confirm payment for this invoice");
		}



		// Update invoice status and payment date
		invoice.setStatus(InvoiceStatus.PAID);
		invoice.setPaidDate(LocalDateTime.now());

		// Set payment method
		if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
			invoice.setPaymentMethod(request.getPaymentMethod());
		}

		// Update rescue request status to PAID
		rescueRequest.setStatus(RescueRequestStatus.PAID);
		rescueRequestRepository.save(rescueRequest);

		// Send notification about payment
		notificationEventProducer.sendNotificationEvent(NotificationEvent.builder()
				.recipientId(userId)
				.title("Xác nhận thanh toán hóa đơn")
				.content("Hóa đơn của bạn đã được xác nhận thanh toán. Cảm ơn bạn đã sử dụng dịch vụ.")
				.type(NotificationType.INVOICE_PAID)
				.sentAt(LocalDateTime.now())
				.build());

		// Save updated invoice
		Invoice updatedInvoice = invoiceRepository.save(invoice);
		return toResponse(updatedInvoice);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void deleteInvoice(String id) {
		// Find the invoice
		Invoice invoice = invoiceRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

		// Delete the invoice
		invoiceRepository.delete(invoice);
	}

	/**
	 * Converts an Invoice entity to an InvoiceResponse DTO.
	 *
	 * @param invoice The invoice entity to convert
	 * @return The corresponding InvoiceResponse DTO
	 */
	private InvoiceResponse toResponse(Invoice invoice) {
		return InvoiceResponse.builder()
				.id(invoice.getId())
				.rescueRequestId(invoice.getRescueRequest().getId())
				.invoiceNumber(invoice.getInvoiceNumber())
				.amount(invoice.getAmount())
				.invoiceDate(invoice.getInvoiceDate())
				.dueDate(invoice.getDueDate())
				.paidDate(invoice.getPaidDate())
				.status(invoice.getStatus())
				.paymentMethod(invoice.getPaymentMethod())
				.notes(invoice.getNotes())
				.createdAt(invoice.getCreatedAt())
				.build();
	}

	/**
	 * Helper method to get the next invoice sequence number.
	 * This is used to generate unique invoice numbers.
	 *
	 * @return The next available sequence number
	 */
	private int getNextInvoiceSequence() {
		// For simplicity, this implementation just counts existing invoices and adds 1
		// In a production environment, this could be replaced with a database sequence or counter table
		long count = invoiceRepository.count();
		return (int) count + 1;
	}
}