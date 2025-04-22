package com.example.backend.model.enums;

public enum RescueRequestStatus {
	CREATED,                   // Người dùng gửi yêu cầu
	ACCEPTED_BY_COMPANY,       // Company tiếp nhận yêu cầu
	RESCUE_VEHICLE_DISPATCHED, // Xe cứu hộ được điều tới địa điểm
	RESCUE_VEHICLE_ARRIVED,    // Xe cứu hộ xác nhận đã đến nơi
	INSPECTION_DONE,           // Đã kiểm tra tình trạng xe
	PRICE_UPDATED,             // Company cập nhật tình trạng + giá
	PRICE_CONFIRMED,           // User chấp nhận giá
	REJECTED_BY_USER,          // User từ chối giá
	IN_PROGRESS,               // Đang sửa chữa
	COMPLETED,                 // Đã hoàn tất sửa chữa
	INVOICED,                  // Gửi hóa đơn
	PAID,                      // Đã thanh toán
	// Hủy bỏ yêu cầu
	CANCELLED_BY_USER,         // Người dùng hủy yêu cầu
	CANCELLED_BY_COMPANY       // Company hủy/yêu cầu từ chối hỗ trợ
}
