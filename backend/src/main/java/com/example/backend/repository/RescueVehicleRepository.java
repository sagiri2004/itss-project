package com.example.backend.repository;

import com.example.backend.model.RescueVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueVehicleRepository extends JpaRepository<RescueVehicle, String> {
}
