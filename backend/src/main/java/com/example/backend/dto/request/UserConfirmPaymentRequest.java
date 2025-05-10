package com.example.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for user confirming payment of an invoice")
public class UserConfirmPaymentRequest {

	@Schema(description = "Payment method used", example = "Credit Card")
	private String paymentMethod;
}