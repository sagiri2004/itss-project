package com.example.backend.service;

import com.example.backend.dto.request.RescueVehicleRequest;
import com.example.backend.dto.response.RescueVehicleResponse;

import java.util.List;

public interface RescueVehicleService {
	RescueVehicleResponse create(RescueVehicleRequest request);
	RescueVehicleResponse update(String id, RescueVehicleRequest request);
	void delete(String id);
	RescueVehicleResponse getById(String id);
	List<RescueVehicleResponse> getAll();
}
