package com.example.backend.model;

import com.example.backend.model.common.Address;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescueCompany {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	String name;
	String phone;
	String description;

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "latitude", column = @Column(name = "address_latitude")),
			@AttributeOverride(name = "longitude", column = @Column(name = "address_longitude"))
	})
	Address address;
	Double latitude;
	Double longitude;
	String userId;

	@CreationTimestamp
	LocalDateTime createdAt;
}
