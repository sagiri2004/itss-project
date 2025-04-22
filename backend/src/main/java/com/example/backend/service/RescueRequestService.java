package com.example.backend.service;

import com.example.backend.dto.request.RescueRequestCreateRequest;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.model.enums.RescueRequestStatus;

import java.util.List;

public interface RescueRequestService {
	RescueRequestResponse createRescueRequest(RescueRequestCreateRequest request, String token);
	List<RescueRequestResponse> getRequestsForCompany(String token, RescueRequestStatus status);
	RescueRequestResponse acceptRequest(String requestId, String token);
	RescueRequestResponse cancelByUser(String requestId, String token);
	RescueRequestResponse cancelByCompany(String requestId, String token);
	RescueRequestResponse dispatchRescueVehicle(String requestId, String vehicleId, String token);
	RescueRequestResponse markVehicleArrived(String requestId, String token);
	RescueRequestResponse markInspectionDone(String requestId, String token);
	RescueRequestResponse updatePrice(String requestId, Double newPrice, String notes, String token);
	RescueRequestResponse confirmPrice(String requestId, String token);
	RescueRequestResponse rejectPrice(String requestId, String token);
	RescueRequestResponse startRepair(String requestId, String token);
	RescueRequestResponse completeRepair(String requestId, String token);
}
