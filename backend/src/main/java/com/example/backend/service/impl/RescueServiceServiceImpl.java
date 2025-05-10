package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.enums.RescueServiceType;
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
				.type(request.getType())
				.company(company)
				.build();

		return toResponse(repository.save(service), null);
	}

	@Override
	public List<RescueServiceResponse> getByCompany(String companyId) {
		return repository.findByCompanyId(companyId).stream()
				.map(service -> toResponse(service, null))
				.collect(Collectors.toList());
	}

	@Override
	public List<RescueServiceResponse> getAll() {
		return repository.findAll().stream()
				.map(service -> toResponse(service, null))
				.collect(Collectors.toList());
	}

	@Override
	public List<RescueServiceResponse> findNearbyServices(Double latitude, Double longitude, RescueServiceType serviceType, Integer limit) {
		if (latitude == null || longitude == null || serviceType == null || limit == null || limit <= 0) {
			throw new IllegalArgumentException("Latitude, longitude, service type, and limit must be valid");
		}
		if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
			throw new IllegalArgumentException("Invalid latitude or longitude values");
		}

		return repository.findNearbyServicesWithDistance(latitude, longitude, serviceType.name(), limit).stream()
				.map(result -> toResponse((RescueService) result[0], (Double) result[1]))
				.collect(Collectors.toList());
	}

	private RescueServiceResponse toResponse(RescueService service, Double distance) {
		RescueCompany company = service.getCompany();
		if (company == null) {
			throw new IllegalStateException("RescueService must have an associated RescueCompany");
		}

		return RescueServiceResponse.builder()
				.id(service.getId())
				.name(service.getName())
				.description(service.getDescription())
				.price(service.getPrice())
				.type(service.getType())
				.distance(distance)
				.company(RescueServiceResponse.CompanyInfo.builder()
						.id(company.getId())
						.name(company.getName())
						.phone(company.getPhone())
						.description(company.getDescription())
						.latitude(company.getLatitude())
						.longitude(company.getLongitude())
						.address(company.getAddress())
						.createdAt(company.getCreatedAt())
						.build())
				.build();
	}
}