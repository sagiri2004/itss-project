package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RescueServiceResponse {
	private String id;
	private String name;
	private String description;
	private Double price;
	private String companyName;
}
