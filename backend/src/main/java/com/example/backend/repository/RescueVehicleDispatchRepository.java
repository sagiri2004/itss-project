package com.example.backend.repository;

import com.example.backend.model.RescueRequest;
import com.example.backend.model.RescueVehicle;
import com.example.backend.model.RescueVehicleDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueVehicleDispatchRepository extends JpaRepository<RescueVehicleDispatch, String> {
	List<RescueVehicleDispatch> findByRescueRequest(RescueRequest request);
	List<RescueVehicleDispatch> findByRescueVehicle(RescueVehicle vehicle);
	boolean existsByRescueRequestAndRescueVehicle(RescueRequest request, RescueVehicle vehicle);
}