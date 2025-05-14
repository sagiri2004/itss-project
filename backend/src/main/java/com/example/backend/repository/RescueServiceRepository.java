package com.example.backend.repository;

import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.enums.RescueServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescueServiceRepository extends JpaRepository<RescueService, String> {
	List<RescueService> findByCompanyId(String companyId);

	List<RescueService> findByCompany(RescueCompany company);

	@Query(value = "SELECT rs.*, " +
			"(6371 * acos(cos(radians(:latitude)) * cos(radians(c.latitude)) * " +
			"cos(radians(c.longitude) - radians(:longitude)) + " +
			"sin(radians(:latitude)) * sin(radians(c.latitude)))) AS distance " +
			"FROM rescue_services rs JOIN rescue_companies c ON rs.company_id = c.id " +
			"WHERE rs.type = :serviceType " +
			"ORDER BY distance ASC LIMIT :limit", nativeQuery = true)
	List<Object[]> findNearbyServicesWithDistance(
			@Param("latitude") Double latitude,
			@Param("longitude") Double longitude,
			@Param("serviceType") String serviceType,
			@Param("limit") Integer limit);

	@Query("SELECT s FROM RescueService s WHERE NOT EXISTS (SELECT r FROM CompanyRating r WHERE r.service = s)")
	List<RescueService> findUnreviewedServices();

	@Query("SELECT s FROM RescueService s WHERE s.company = :company AND NOT EXISTS (SELECT r FROM CompanyRating r WHERE r.service = s)")
	List<RescueService> findUnreviewedServicesByCompany(@Param("company") RescueCompany company);
}