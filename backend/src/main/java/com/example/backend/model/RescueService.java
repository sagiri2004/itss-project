package com.example.backend.model;

import com.example.backend.model.enums.RescueServiceType;
import com.example.backend.model.enums.RescueServiceStatus;
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

	@Enumerated(EnumType.STRING)
	RescueServiceType type;

	@Enumerated(EnumType.STRING)
	RescueServiceStatus status = RescueServiceStatus.ACTIVE;

	@ManyToOne
	@JoinColumn(name = "company_id")
	RescueCompany company;
}
