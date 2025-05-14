package com.example.backend.dto.request;

import lombok.Data;

@Data
public class RescueRequestCreateRequest {
	private String rescueServiceId;
	private String description;
	private Double latitude;
	private Double longitude;
	private String vehicleImageUrl;
	private String vehicleMake;
	private String vehicleModel;
	private String vehicleYear;
	private String vehicleLicensePlate;
	private String vehicleColor;
}
