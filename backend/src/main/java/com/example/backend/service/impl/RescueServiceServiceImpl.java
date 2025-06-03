package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.enums.RescueServiceType;
import com.example.backend.repository.CompanyRatingRepository;
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
	private final CompanyRatingRepository ratingRepository;

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