package com.example.backend.controller;

import com.example.backend.dto.request.RescueVehicleRequest;
import com.example.backend.dto.response.RescueVehicleResponse;
import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.service.RescueVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rescue-vehicles")
@RequiredArgsConstructor
public class RescueVehicleController {

	private final RescueVehicleService vehicleService;

	@PostMapping
	public RescueVehicleResponse create(@RequestBody RescueVehicleRequest request) {
		return vehicleService.create(request);
	}

	@PutMapping("/{id}")
	public RescueVehicleResponse update(@PathVariable String id, @RequestBody RescueVehicleRequest request) {
		return vehicleService.update(id, request);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable String id) {
		vehicleService.delete(id);
	}

	@GetMapping("/{id}")
	public RescueVehicleResponse getById(@PathVariable String id) {
		return vehicleService.getById(id);
	}

	@GetMapping
	public List<RescueVehicleResponse> getAll() {
		return vehicleService.getAll();
	}

	@GetMapping("/equipment-types")
	public RescueEquipment[] getEquipmentTypes() {
		return RescueEquipment.values();
	}
}
