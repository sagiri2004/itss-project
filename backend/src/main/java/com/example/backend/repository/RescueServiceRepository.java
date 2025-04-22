package com.example.backend.repository;

import com.example.backend.model.RescueService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RescueServiceRepository extends JpaRepository<RescueService, String> {
	List<RescueService> findByCompanyId(String companyId);
}
