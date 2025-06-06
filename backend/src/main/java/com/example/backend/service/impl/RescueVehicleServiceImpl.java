package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueVehicleRequest;
import com.example.backend.dto.request.VehicleStatusRequest;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
				.name(request.getName())
				.licensePlate(request.getLicensePlate())
				.model(request.getModel())
				.make(request.getMake())
				.equipmentDetails(request.getEquipmentDetails())
				.status(request.getStatus() != null ? request.getStatus() : RescueVehicleStatus.AVAILABLE)
				.currentLatitude(request.getCurrentLatitude())
				.currentLongitude(request.getCurrentLongitude())
				.assignedDriverName(request.getAssignedDriverName())
				.lastMaintenanceDate(request.getLastMaintenanceDate())
				.nextMaintenanceDate(request.getNextMaintenanceDate())
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

		vehicle.setName(request.getName());
		vehicle.setLicensePlate(request.getLicensePlate());
		vehicle.setModel(request.getModel());
		vehicle.setMake(request.getMake());
		vehicle.setEquipmentDetails(request.getEquipmentDetails());
		vehicle.setStatus(request.getStatus());
		vehicle.setCurrentLatitude(request.getCurrentLatitude());
		vehicle.setCurrentLongitude(request.getCurrentLongitude());
		vehicle.setAssignedDriverName(request.getAssignedDriverName());
		vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
		vehicle.setNextMaintenanceDate(request.getNextMaintenanceDate());
		vehicle.setCompany(company);

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

	@Override
	public List<RescueVehicleResponse> getByCompany(String companyId) {
		return vehicleRepository.findAll().stream()
				.filter(v -> v.getCompany() != null && companyId.equals(v.getCompany().getId()))
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public RescueVehicleResponse updateStatus(String id, VehicleStatusRequest request) {
		RescueVehicle vehicle = vehicleRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Rescue vehicle not found"));

		// Update status
		vehicle.setStatus(request.getStatus());

		// If vehicle is going into maintenance (OUT_OF_SERVICE)
		if (request.getStatus() == RescueVehicleStatus.OUT_OF_SERVICE) {
			// Update maintenance dates
			vehicle.setLastMaintenanceDate(LocalDateTime.now());
			// Set next maintenance date to 3 months from now
			vehicle.setNextMaintenanceDate(LocalDateTime.now().plusMonths(3));
			
			// Store maintenance information
			if (request.getMaintenanceNote() != null) {
				vehicle.setMaintenanceNote(request.getMaintenanceNote());
			}
			if (request.getMaintenanceReason() != null) {
				vehicle.setMaintenanceReason(request.getMaintenanceReason());
			}
		}
		// If vehicle has completed maintenance
		else if (request.getStatus() == RescueVehicleStatus.MAINTENANCE_COMPLETED) {
			// Update maintenance completion information
			if (request.getMaintenanceNote() != null) {
				vehicle.setMaintenanceNote(request.getMaintenanceNote());
			}
			// Set status back to AVAILABLE after a short delay
			vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
		}

		return toResponse(vehicleRepository.save(vehicle));
	}

	private RescueVehicleResponse toResponse(RescueVehicle vehicle) {
		return RescueVehicleResponse.builder()
				.id(vehicle.getId())
				.name(vehicle.getName())
				.licensePlate(vehicle.getLicensePlate())
				.model(vehicle.getModel())
				.make(vehicle.getMake())
				.equipmentDetails(vehicle.getEquipmentDetails())
				.status(vehicle.getStatus())
				.currentLatitude(vehicle.getCurrentLatitude())
				.currentLongitude(vehicle.getCurrentLongitude())
				.assignedDriverName(vehicle.getAssignedDriverName())
				.companyId(vehicle.getCompany() != null ? vehicle.getCompany().getId() : null)
				.companyName(vehicle.getCompany() != null ? vehicle.getCompany().getName() : null)
				.lastMaintenanceDate(vehicle.getLastMaintenanceDate())
				.nextMaintenanceDate(vehicle.getNextMaintenanceDate())
				.build();
	}
}
