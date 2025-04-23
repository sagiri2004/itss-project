package com.example.backend.repository;

import com.example.backend.model.Invoice;
import com.example.backend.model.RescueRequest;
import com.example.backend.model.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
	Optional<Invoice> findByRescueRequest(RescueRequest rescueRequest);
	boolean existsByRescueRequest(RescueRequest rescueRequest);
	Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
	List<Invoice> findByRescueRequestIn(List<RescueRequest> rescueRequests);
	List<Invoice> findByStatus(InvoiceStatus status);
}