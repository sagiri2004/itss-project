package com.example.backend.service;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;

import java.util.List;

public interface RescueServiceService {
	RescueServiceResponse create(RescueServiceRequest request);
	List<RescueServiceResponse> getByCompany(String companyId);
	List<RescueServiceResponse> getAll();
}