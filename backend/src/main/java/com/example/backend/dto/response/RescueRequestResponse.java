package com.example.backend.dto.response;

import com.example.backend.model.enums.RescueRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RescueRequestResponse {
	private String id;
	private String userId;
	private String serviceId;
	private String serviceName;
	private String companyId;
	private String companyName;
	private Double latitude;
	private Double longitude;
	private String description;
	private Double estimatedPrice;
	private Double finalPrice;
	private RescueRequestStatus status;
	private LocalDateTime createdAt;
	private String notes;
}
