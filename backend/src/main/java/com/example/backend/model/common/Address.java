package com.example.backend.model.common;

import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address {
	String street;
	String ward;
	String district;
	String city;
	String country;
	String fullAddress;
	Double latitude;
	Double longitude;
}
