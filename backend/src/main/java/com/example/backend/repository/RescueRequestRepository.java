package com.example.backend.repository;


import com.example.backend.model.RescueRequest;
import com.example.backend.model.RescueService;
import com.example.backend.model.User;
import com.example.backend.model.enums.RescueRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RescueRequestRepository extends JpaRepository<RescueRequest, String> {
	List<RescueRequest> findByUserId(String userId);

	List<RescueRequest> findByRescueServiceInAndStatus(List<RescueService> services, RescueRequestStatus status);

	List<RescueRequest> findByRescueServiceIn(List<RescueService> services);
	
	List<RescueRequest> findByCompanyId(String companyId);

	List<RescueRequest> findByUser(User user);
}
