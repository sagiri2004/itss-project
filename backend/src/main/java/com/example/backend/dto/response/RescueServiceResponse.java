package com.example.backend.dto.response;

import com.example.backend.model.common.Address;
import com.example.backend.model.enums.RescueServiceType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueServiceResponse {
	private String id;
	private String name;
	private String description;
	private Double price;
	private RescueServiceType type;
	private String companyId;
	private String companyName;
	private Double distance;
	private Double averageRating;
	private Long totalRatings;
	private CompanyInfo company;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class CompanyInfo {
		private String id;
		private String name;
		private String phone;
		private String description;
		private Double latitude;
		private Double longitude;
		private Address address;
		private LocalDateTime createdAt;
	}
}