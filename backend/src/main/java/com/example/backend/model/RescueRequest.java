package com.example.backend.model;

import com.example.backend.model.enums.RescueRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_requests")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescueRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	@ManyToOne
	@JoinColumn(name = "user_id")
	User user;

	@ManyToOne
	@JoinColumn(name = "service_id")
	RescueService rescueService;

	@ManyToOne
	@JoinColumn(name = "company_id")
	RescueCompany company;

	@Enumerated(EnumType.STRING)
	RescueRequestStatus status;

	Double latitude;
	Double longitude;
	String description;

	Double estimatedPrice;
	Double finalPrice;

	@CreationTimestamp
	LocalDateTime createdAt;

	String notes;
}
