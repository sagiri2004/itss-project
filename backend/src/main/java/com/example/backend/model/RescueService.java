package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "rescue_services")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescueService {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	String name;
	String description;
	Double price;

	@ManyToOne
	@JoinColumn(name = "company_id")
	RescueCompany company;
}