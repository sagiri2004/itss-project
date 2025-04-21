package com.example.backend.dto.response;

import com.example.backend.model.common.Address;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescueCompanyResponse {
	String id;
	String name;
	String phone;
	String description;
	Address address;
	Double latitude;
	Double longitude;
	String userId;
}
