package com.example.backend.model.enums;

public enum RescueVehicleDispatchStatus {
	DISPATCHED,    // Xe đã được điều động
	ARRIVED,       // Xe đã đến nơi
	IN_PROGRESS,   // Đang thực hiện cứu hộ
	COMPLETED,     // Đã hoàn thành cứu hộ
	CANCELLED      // Hủy điều động
}