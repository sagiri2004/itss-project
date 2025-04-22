package com.example.backend.repository;

import com.example.backend.model.RescueCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RescueCompanyRepository extends JpaRepository<RescueCompany, String> {
	Optional<RescueCompany> findByUserId(String userId);

	List<RescueCompany> findAllByUserId(String userId);
}
