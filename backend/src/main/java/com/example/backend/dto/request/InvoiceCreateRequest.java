package com.example.backend.dto.request;

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
@Schema(description = "Request object for creating a new invoice")
public class InvoiceCreateRequest {

    @Schema(description = "ID of the rescue request for which the invoice is created", required = true, example = "5f8d0f5c-1c7a-4b7c-9b4a-9d1c8a7e5d6c")
    private String rescueRequestId;

    @Schema(description = "Total amount to be charged", required = true, example = "250000.0")
    private Double amount;

    @Schema(description = "Due date for payment", example = "2023-12-31T23:59:59")
    private LocalDateTime dueDate;

    @Schema(description = "Additional notes about the invoice", example = "Payment for rescue and repair services")
    private String notes;
}