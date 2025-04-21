package com.example.backend.service;

import com.example.backend.dto.request.RescueCompanyRequest;
import com.example.backend.dto.response.RescueCompanyResponse;

import java.util.List;

public interface RescueCompanyService {
	RescueCompanyResponse create(RescueCompanyRequest request, String userId);
	RescueCompanyResponse update(String id, RescueCompanyRequest request);
	void delete(String id);
	RescueCompanyResponse getById(String id);
	List<RescueCompanyResponse> getAll();
}
