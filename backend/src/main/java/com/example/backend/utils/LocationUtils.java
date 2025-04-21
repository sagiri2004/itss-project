package com.example.backend.utils;

import com.example.backend.model.common.Address;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
public class LocationUtils {

	public Address getAddressFromCoordinates(Double lat, Double lng) {
		try {
			String url = String.format("https://nominatim.openstreetmap.org/reverse?lat=%s&lon=%s&format=json", lat, lng);
			RestTemplate restTemplate = new RestTemplate();
			var json = restTemplate.getForObject(url, Map.class);

			// Extract address components
			Map<?, ?> address = (Map<?, ?>) json.get("address");

			// Build Address object
			return Address.builder()
					.street((String) address.get("road"))
					.ward((String) address.get("suburb"))
					.district((String) address.get("county"))
					.city((String) address.get("city"))
					.country((String) address.get("country"))
					.fullAddress(String.format("%s, %s, %s, %s, %s",
							address.get("road"), address.get("suburb"), address.get("county"), address.get("city"), address.get("country")))
					.latitude(lat)
					.longitude(lng)
					.build();
		} catch (Exception e) {
			log.error("Failed to fetch address from coordinates", e);
			// Return a default Address object if there's an error
			return Address.builder()
					.street("Unknown")
					.ward("Unknown")
					.district("Unknown")
					.city("Unknown")
					.country("Unknown")
					.fullAddress("Unknown location")
					.latitude(lat)
					.longitude(lng)
					.build();
		}
	}
}
