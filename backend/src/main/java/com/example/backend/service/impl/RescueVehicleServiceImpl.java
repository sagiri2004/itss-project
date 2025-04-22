package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueVehicleRequest;
import com.example.backend.dto.response.RescueVehicleResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueVehicle;
import com.example.backend.model.enums.RescueVehicleStatus;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.RescueVehicleRepository;
import com.example.backend.service.RescueVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RescueVehicleServiceImpl implements RescueVehicleService {

	private final RescueVehicleRepository vehicleRepository;
	private final RescueCompanyRepository companyRepository;

	@Override
	public RescueVehicleResponse create(RescueVehicleRequest request) {
		RescueCompany company = companyRepository.findById(request.getCompanyId())
				.orElseThrow(() -> new ResourceNotFoundException("Rescue company not found"));

		RescueVehicle vehicle = RescueVehicle.builder()
				.licensePlate(request.getLicensePlate())
				.model(request.getModel())
				.equipmentDetails(request.getEquipmentDetails())
				.status(request.getStatus() != null ? request.getStatus() : RescueVehicleStatus.AVAILABLE)
				.company(company)
				.build();

		return toResponse(vehicleRepository.save(vehicle));
	}

	@Override
	public RescueVehicleResponse update(String id, RescueVehicleRequest request) {
		RescueVehicle vehicle = vehicleRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue vehicle not found"));

		RescueCompany company = companyRepository.findById(request.getCompanyId())
				.orElseThrow(() -> new ResourceNotFoundException("Rescue company not found"));

		vehicle.setLicensePlate(request.getLicensePlate());
		vehicle.setModel(request.getModel());
		vehicle.setEquipmentDetails(request.getEquipmentDetails());
		vehicle.setCompany(company);
		vehicle.setStatus(request.getStatus());

		return toResponse(vehicleRepository.save(vehicle));
	}

	@Override
	public void delete(String id) {
		if (!vehicleRepository.existsById(id)) {
			throw new ResourceNotFoundException("Rescue vehicle not found");
		}
		vehicleRepository.deleteById(id);
	}

	@Override
	public RescueVehicleResponse getById(String id) {
		return vehicleRepository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue vehicle not found"));
	}

	@Override
	public List<RescueVehicleResponse> getAll() {
		return vehicleRepository.findAll().stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	private RescueVehicleResponse toResponse(RescueVehicle vehicle) {
		return RescueVehicleResponse.builder()
				.id(vehicle.getId())
				.licensePlate(vehicle.getLicensePlate())
				.model(vehicle.getModel())
				.companyId(vehicle.getCompany().getId())
				.companyName(vehicle.getCompany().getName())
				.equipmentDetails(vehicle.getEquipmentDetails())
				.status(vehicle.getStatus())
				.build();
	}
}
