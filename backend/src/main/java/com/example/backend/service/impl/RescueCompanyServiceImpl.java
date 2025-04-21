package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueCompanyRequest;
import com.example.backend.dto.response.RescueCompanyResponse;
import com.example.backend.exception.AuthException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.common.Address;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.service.RescueCompanyService;
import com.example.backend.utils.LocationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RescueCompanyServiceImpl implements RescueCompanyService {

	private final RescueCompanyRepository repository;
	private final LocationUtils locationUtils;

	@Override
	public RescueCompanyResponse create(RescueCompanyRequest request, String userId) {
		// Get the address from coordinates
		Address address = locationUtils.getAddressFromCoordinates(request.getLatitude(), request.getLongitude());

		// Create the RescueCompany with Address
		RescueCompany company = RescueCompany.builder()
				.name(request.getName())
				.phone(request.getPhone())
				.description(request.getDescription())
				.latitude(request.getLatitude())
				.longitude(request.getLongitude())
				.address(address)
				.userId(userId)
				.createdAt(LocalDateTime.now())
				.build();

		// Save to repository and return response
		return toResponse(repository.save(company));
	}

	@Override
	public RescueCompanyResponse update(String id, RescueCompanyRequest request) {
		RescueCompany company = repository.findById(id)
				.orElseThrow(() -> new AuthException("Rescue company not found"));

		// Update details of the company
		company.setName(request.getName());
		company.setPhone(request.getPhone());
		company.setDescription(request.getDescription());
		company.setLatitude(request.getLatitude());
		company.setLongitude(request.getLongitude());
		company.setAddress(locationUtils.getAddressFromCoordinates(request.getLatitude(), request.getLongitude()));

		// Save updated company and return response
		return toResponse(repository.save(company));
	}

	@Override
	public void delete(String id) {
		if (!repository.existsById(id)) {
			throw new AuthException("Rescue company not found");
		}
		repository.deleteById(id);
	}

	@Override
	public RescueCompanyResponse getById(String id) {
		return repository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new AuthException("Rescue company not found"));
	}

	@Override
	public List<RescueCompanyResponse> getAll() {
		return repository.findAll().stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	private RescueCompanyResponse toResponse(RescueCompany company) {
		return RescueCompanyResponse.builder()
				.id(company.getId())
				.name(company.getName())
				.phone(company.getPhone())
				.description(company.getDescription())
				.latitude(company.getLatitude())
				.longitude(company.getLongitude())
				.address(company.getAddress()) // Include the address in response
				.userId(company.getUserId())
				.build();
	}
}
