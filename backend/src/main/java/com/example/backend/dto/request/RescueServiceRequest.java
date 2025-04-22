package com.example.backend.dto.request;

import lombok.Data;

@Data
public class RescueServiceRequest {
	private String name;
	private String description;
	private Double price;
	private String companyId;
}
