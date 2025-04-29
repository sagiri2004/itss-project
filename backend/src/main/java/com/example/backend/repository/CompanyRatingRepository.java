package com.example.backend.repository;

import com.example.backend.model.CompanyRating;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRatingRepository extends JpaRepository<CompanyRating, String> {
    List<CompanyRating> findByCompanyOrderByCreatedAtDesc(RescueCompany company);
    
    Optional<CompanyRating> findByCompanyAndUser(RescueCompany company, User user);
    
    @Query("SELECT AVG(r.stars) FROM CompanyRating r WHERE r.company = ?1")
    Double calculateAverageRating(RescueCompany company);
    
    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.company = ?1")
    Long countRatingsByCompany(RescueCompany company);
    
    @Query("SELECT COUNT(r) FROM CompanyRating r WHERE r.company = ?1 AND r.stars = ?2")
    Long countRatingsByCompanyAndStars(RescueCompany company, Integer stars);
}