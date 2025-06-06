package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueServiceDeletionRequest;
import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceDeletionResponse;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.enums.RescueServiceType;
import com.example.backend.repository.CompanyRatingRepository;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.RescueServiceDeletionRequestRepository;
import com.example.backend.repository.RescueServiceRepository;
import com.example.backend.service.RescueServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RescueServiceServiceImpl implements RescueServiceService {

	private final RescueServiceRepository repository;
	private final RescueCompanyRepository companyRepository;
	private final CompanyRatingRepository ratingRepository;
	private final RescueServiceDeletionRequestRepository rescueServiceDeletionRequestRepository;

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
				.status(request.getStatus() != null ? request.getStatus() : com.example.backend.model.enums.RescueServiceStatus.ACTIVE)
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
	public List<RescueServiceResponse> findNearbyServices(Double latitude, Double longitude,
			RescueServiceType serviceType, Integer limit) {
		if (latitude == null || longitude == null || serviceType == null || limit == null || limit <= 0) {
			throw new IllegalArgumentException("Latitude, longitude, service type, and limit must be valid");
		}
		if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
			throw new IllegalArgumentException("Invalid latitude or longitude values");
		}

		return repository.findNearbyServicesWithDistance(latitude, longitude, serviceType.name(), limit).stream()
				.map(result -> {
					String id = (String) result[0];
					String name = (String) result[1];
					String description = (String) result[2];
					Double price = result[3] != null ? ((Number) result[3]).doubleValue() : null;
					String type = (String) result[4];
					String companyId = (String) result[5];
					String companyName = (String) result[6];
					String companyPhone = (String) result[7];
					String companyDescription = (String) result[8];
					Double companyLatitude = result[9] != null ? ((Number) result[9]).doubleValue() : null;
					Double companyLongitude = result[10] != null ? ((Number) result[10]).doubleValue() : null;
					java.sql.Timestamp companyCreatedAt = (java.sql.Timestamp) result[11];
					Double distance = result[12] != null ? ((Number) result[12]).doubleValue() : null;
					String street = (String) result[13];
					String ward = (String) result[14];
					String district = (String) result[15];
					String city = (String) result[16];
					String country = (String) result[17];
					String fullAddress = (String) result[18];
					String status = (String) result[19];

					com.example.backend.model.common.Address address = com.example.backend.model.common.Address.builder()
						.street(street)
						.ward(ward)
						.district(district)
						.city(city)
						.country(country)
						.fullAddress(fullAddress)
						.latitude(companyLatitude)
						.longitude(companyLongitude)
						.build();

					RescueServiceResponse.CompanyInfo companyInfo = RescueServiceResponse.CompanyInfo.builder()
						.id(companyId)
						.name(companyName)
						.phone(companyPhone)
						.description(companyDescription)
						.latitude(companyLatitude)
						.longitude(companyLongitude)
						.address(address)
						.createdAt(companyCreatedAt != null ? companyCreatedAt.toLocalDateTime() : null)
						.build();

					// Lấy danh sách ratings theo id
					var ratings = ratingRepository.findByService_IdOrderByCreatedAtDesc(id);
					double averageRating = 0.0;
					long totalRatings = 0L;
					if (ratings != null && !ratings.isEmpty()) {
						totalRatings = ratings.size();
						averageRating = ratings.stream().mapToInt(r -> r.getStars()).average().orElse(0.0);
					}

					return RescueServiceResponse.builder()
						.id(id)
						.name(name)
						.description(description)
						.price(price)
						.type(type != null ? RescueServiceType.valueOf(type) : null)
						.companyId(companyId)
						.companyName(companyName)
						.distance(distance)
						.company(companyInfo)
						.averageRating(averageRating)
						.totalRatings(totalRatings)
						.status(status != null ? com.example.backend.model.enums.RescueServiceStatus.valueOf(status) : com.example.backend.model.enums.RescueServiceStatus.ACTIVE)
						.build();
				})
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
				.status(service.getStatus())
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


	@Override
	public RescueServiceDeletionResponse requestDeletion(String serviceId, RescueServiceDeletionRequest request) {
		// Validate service exists
		RescueService service = repository.findById(serviceId)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue service not found with id: " + serviceId));
		
		// Get company from service
		RescueCompany company = service.getCompany();
		if (company == null) {
			throw new IllegalStateException("Service must have an associated company");
		}

		// Create deletion request with generated ID
		com.example.backend.model.RescueServiceDeletionRequest deletionRequest = com.example.backend.model.RescueServiceDeletionRequest.builder()
				.id(java.util.UUID.randomUUID().toString()) // Generate UUID for the request
				.service(service)
				.company(company)
				.reason(request.getReason())
				.status(com.example.backend.model.RescueServiceDeletionRequest.Status.PENDING)
				.createdAt(LocalDateTime.now())
				.build();

		// Save deletion request
		com.example.backend.model.RescueServiceDeletionRequest savedRequest = rescueServiceDeletionRequestRepository.save(deletionRequest);

		// Return response
		return RescueServiceDeletionResponse.builder()
				.id(savedRequest.getId())
				.serviceId(service.getId())
				.serviceName(service.getName())
				.companyId(company.getId())
				.companyName(company.getName())
				.reason(savedRequest.getReason())
				.status(savedRequest.getStatus())
				.createdAt(savedRequest.getCreatedAt())
				.processedAt(savedRequest.getProcessedAt())
				.build();
	}

	@Override
	public RescueServiceResponse update(String serviceId, RescueServiceRequest request) {
		// Validate service exists
		RescueService service = repository.findById(serviceId)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue service not found with id: " + serviceId));
		
		// Validate company exists and matches
		RescueCompany company = companyRepository.findById(request.getCompanyId())
				.orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));
		
		if (!service.getCompany().getId().equals(company.getId())) {
			throw new IllegalArgumentException("Service does not belong to the specified company");
		}

		// Update service information
		service.setName(request.getName());
		service.setDescription(request.getDescription());
		service.setPrice(request.getPrice());
		service.setType(request.getType());
		if (request.getStatus() != null) {
			service.setStatus(request.getStatus());
		}

		// Save updated service
		RescueService updatedService = repository.save(service);

		// Return response
		return toResponse(updatedService, null);
	}
}