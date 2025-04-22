package com.example.backend.dto.response;

import com.example.backend.model.enums.RescueServiceType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RescueServiceResponse {
	private String id;
	private String name;
	private String description;
	private Double price;
	private RescueServiceType type;
	private String companyId;
	private String companyName;
}
