package com.example.backend.service;

import com.example.backend.dto.request.InvoiceCreateRequest;
import com.example.backend.dto.request.InvoiceUpdateRequest;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.model.enums.InvoiceStatus;

import java.util.List;

/**
 * Service interface for managing invoices in the system.
 * Provides methods for creating, retrieving, updating, and deleting invoices.
 */
public interface InvoiceService {

	/**
	 * Retrieves all invoices in the system.
	 *
	 * @return A list of all invoices
	 */
	List<InvoiceResponse> getAllInvoices();

	/**
	 * Retrieves a specific invoice by its ID.
	 *
	 * @param id The unique identifier of the invoice
	 * @return The requested invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if the invoice doesn't exist
	 */
	InvoiceResponse getInvoiceById(String id);

	/**
	 * Retrieves an invoice associated with a specific rescue request.
	 *
	 * @param rescueRequestId The ID of the rescue request
	 * @return The associated invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if no invoice exists for the rescue request
	 */
	InvoiceResponse getInvoiceByRescueRequest(String rescueRequestId);

	/**
	 * Retrieves an invoice by its invoice number.
	 *
	 * @param invoiceNumber The unique invoice number
	 * @return The requested invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if no invoice with the given number exists
	 */
	InvoiceResponse getInvoiceByInvoiceNumber(String invoiceNumber);

	/**
	 * Retrieves all invoices associated with a specific user.
	 *
	 * @param userId The ID of the user
	 * @return A list of invoices for the specified user
	 */
	List<InvoiceResponse> getInvoicesByUserId(String userId);

	/**
	 * Retrieves all invoices associated with a specific company.
	 *
	 * @param companyId The ID of the company
	 * @return A list of invoices for the specified company
	 */
	List<InvoiceResponse> getInvoicesByCompanyId(String companyId);

	/**
	 * Retrieves all invoices associated with the company managed by a specific user.
	 *
	 * @param userId The ID of the user managing the company
	 * @return A list of invoices for the company managed by the specified user
	 */
	List<InvoiceResponse> getInvoicesByCompanyManagerId(String userId);

	/**
	 * Retrieves all invoices with a specific status.
	 *
	 * @param status The invoice status to filter by
	 * @return A list of invoices with the specified status
	 */
	List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status);

	/**
	 * Creates a new invoice in the system.
	 * The system automatically generates a unique invoice number.
	 *
	 * @param request The invoice creation request containing required details
	 * @return The newly created invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if the referenced rescue request doesn't exist
	 * @throws IllegalStateException if an invoice already exists for the specified rescue request
	 */
	InvoiceResponse createInvoice(InvoiceCreateRequest request);

	/**
	 * Updates an existing invoice.
	 *
	 * @param id The ID of the invoice to update
	 * @param request The update request containing fields to be modified
	 * @return The updated invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if the invoice doesn't exist
	 */
	InvoiceResponse updateInvoice(String id, InvoiceUpdateRequest request);

	/**
	 * Marks an invoice as paid.
	 * Sets the status to PAID, records the payment date, and optionally records the payment method.
	 * Also updates the associated rescue request status.
	 *
	 * @param id The ID of the invoice to mark as paid
	 * @param paymentMethod Optional payment method used (cash, card, transfer, etc.)
	 * @return The updated invoice
	 * @throws com.example.backend.exception.ResourceNotFoundException if the invoice doesn't exist
	 * @throws IllegalStateException if the invoice is already marked as paid
	 */
	InvoiceResponse markInvoiceAsPaid(String id, String paymentMethod);

	/**
	 * Deletes an invoice from the system.
	 *
	 * @param id The ID of the invoice to delete
	 * @throws com.example.backend.exception.ResourceNotFoundException if the invoice doesn't exist
	 */
	void deleteInvoice(String id);
}