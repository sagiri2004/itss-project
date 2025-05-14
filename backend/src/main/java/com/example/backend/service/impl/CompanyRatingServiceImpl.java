package com.example.backend.service.impl;

import com.example.backend.dto.request.CompanyRatingRequest;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.CompanyRatingSummary;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.CompanyRating;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.RescueService;
import com.example.backend.model.User;
import com.example.backend.repository.CompanyRatingRepository;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.RescueServiceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CompanyRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyRatingServiceImpl implements CompanyRatingService {
    private final CompanyRatingRepository ratingRepository;
    private final RescueCompanyRepository companyRepository;
    private final RescueServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CompanyRatingResponse rateCompany(CompanyRatingRequest request, String userId) {
        RescueCompany company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        RescueService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if the user has already rated this company for this service
        CompanyRating existingRating = ratingRepository.findByCompanyAndServiceAndUser(company, service, user)
                .orElse(null);
        
        CompanyRating rating;
        if (existingRating != null) {
            // Update existing rating
            existingRating.setStars(request.getStars());
            existingRating.setComment(request.getComment());
            rating = ratingRepository.save(existingRating);
        } else {
            // Create new rating
            rating = CompanyRating.builder()
                    .company(company)
                    .service(service)
                    .user(user)
                    .stars(request.getStars())
                    .comment(request.getComment())
                    .build();
            rating = ratingRepository.save(rating);
        }
        
        return mapToResponse(rating);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CompanyRatingResponse> getCompanyRatings(String companyId) {
        RescueCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        return ratingRepository.findByCompanyOrderByCreatedAtDesc(company)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public CompanyRatingSummary getCompanyRatingSummary(String companyId) {
        RescueCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        Double averageRating = ratingRepository.calculateAverageRating(company);
        Long totalRatings = ratingRepository.countRatingsByCompany(company);
        
        // Calculate star distribution
        Map<Integer, Long> starDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = ratingRepository.countRatingsByCompanyAndStars(company, i);
            starDistribution.put(i, count);
        }
        
        return CompanyRatingSummary.builder()
                .companyId(company.getId())
                .companyName(company.getName())
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalRatings(totalRatings)
                .starDistribution(starDistribution)
                .build();
    }
    
    @Override
    @Transactional
    public void deleteRating(String ratingId, String userId) {
        CompanyRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));
        
        // Check if the user is the owner of the rating
        if (!rating.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this rating");
        }
        
        ratingRepository.delete(rating);
    }
    
    private CompanyRatingResponse mapToResponse(CompanyRating rating) {
        return CompanyRatingResponse.builder()
                .id(rating.getId())
                .companyId(rating.getCompany().getId())
                .companyName(rating.getCompany().getName())
                .serviceId(rating.getService().getId())
                .serviceName(rating.getService().getName())
                .userId(rating.getUser().getId())
                .userName(rating.getUser().getName())
                .stars(rating.getStars())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build();
    }
}