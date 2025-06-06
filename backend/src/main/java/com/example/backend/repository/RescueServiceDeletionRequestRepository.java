package com.example.backend.repository;

import com.example.backend.model.RescueServiceDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RescueServiceDeletionRequestRepository extends JpaRepository<RescueServiceDeletionRequest, String> {
} 