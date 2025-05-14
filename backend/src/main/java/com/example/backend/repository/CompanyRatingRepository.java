package com.example.backend.repository;

import com.example.backend.model.CompanyRating;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRatingRepository extends JpaRepository<CompanyRating, String> {
    List<CompanyRating> findByCompanyOrderByCreatedAtDesc(RescueCompany company);

    Optional<CompanyRating> findByCompanyAndServiceAndUser(RescueCompany company, RescueService service, User user);

    List<CompanyRating> findByServiceOrderByCreatedAtDesc(RescueService service);

    @Query("SELECT AVG(r.stars) FROM CompanyRating r WHERE r.company = ?1")
    Double calculateAverageRating(RescueCompany company);

    @Query("SELECT AVG(r.stars) FROM CompanyRating r WHERE r.service = ?1")
    Double calculateAverageRatingForService(RescueService service);

    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.company = ?1")
    Long countRatingsByCompany(RescueCompany company);

    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.service = ?1")
    Long countRatingsByService(RescueService service);

    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.company = ?1 AND r.stars = ?2")
    Long countRatingsByCompanyAndStars(RescueCompany company, Integer stars);

    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.service = ?1 AND r.stars = ?2")
    Long countRatingsByServiceAndStars(RescueService service, Integer stars);

    List<CompanyRating> findByUser_IdOrderByCreatedAtDesc(String userId);
    List<CompanyRating> findByService_IdOrderByCreatedAtDesc(String serviceId);
    List<CompanyRating> findByCompany_IdOrderByCreatedAtDesc(String companyId);

    @Query("SELECT DISTINCT r.service FROM CompanyRating r")
    List<RescueService> findDistinctServicesWithRatings();

    @Query("SELECT DISTINCT r.service FROM CompanyRating r WHERE r.company = ?1")
    List<RescueService> findDistinctServicesWithRatingsByCompany(RescueCompany company);

    @Query("SELECT s FROM RescueService s WHERE NOT EXISTS (SELECT r FROM CompanyRating r WHERE r.service = s)")
    List<RescueService> findUnreviewedServices();

    @Query("SELECT s FROM RescueService s WHERE s.company = ?1 AND NOT EXISTS (SELECT r FROM CompanyRating r WHERE r.service = s)")
    List<RescueService> findUnreviewedServicesByCompany(RescueCompany company);
}