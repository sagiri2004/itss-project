package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.RescueServiceRepository;
import com.example.backend.service.RescueServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RescueServiceServiceImpl implements RescueServiceService {

	private final RescueServiceRepository repository;
	private final RescueCompanyRepository companyRepository;

	@Override
	public RescueServiceResponse create(RescueServiceRequest request) {
		RescueCompany company = companyRepository.findById(request.getCompanyId())
				.orElseThrow(() -> new ResourceNotFoundException("Company not found"));

		RescueService service = RescueService.builder()
				.name(request.getName())
				.description(request.getDescription())
				.price(request.getPrice())
				.company(company)
				.build();

		return toResponse(repository.save(service));
	}

	@Override
	public List<RescueServiceResponse> getByCompany(String companyId) {
		return repository.findByCompanyId(companyId).stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	public List<RescueServiceResponse> getAll() {
		return repository.findAll().stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	private RescueServiceResponse toResponse(RescueService service) {
		return RescueServiceResponse.builder()
				.id(service.getId())
				.name(service.getName())
				.description(service.getDescription())
				.price(service.getPrice())
				.companyName(service.getCompany().getName())
				.build();
	}
}