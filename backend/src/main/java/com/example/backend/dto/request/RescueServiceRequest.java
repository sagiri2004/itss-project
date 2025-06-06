package com.example.backend.dto.request;

import com.example.backend.model.enums.RescueServiceType;
import com.example.backend.model.enums.RescueServiceStatus;
import lombok.Data;

@Data
public class RescueServiceRequest {
	private String name;
	private String description;
	private Double price;
	private RescueServiceType type;
	private String companyId;
	private RescueServiceStatus status;
}
