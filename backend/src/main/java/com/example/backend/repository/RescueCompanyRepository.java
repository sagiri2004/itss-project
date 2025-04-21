package com.example.backend.repository;

import com.example.backend.model.RescueCompany;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescueCompanyRepository extends JpaRepository<RescueCompany, String> {
}
