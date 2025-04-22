package com.example.backend.model.enums;

public enum InvoiceStatus {
    PENDING,    // Hóa đơn đã tạo, chưa thanh toán
    PAID,       // Hóa đơn đã thanh toán
    CANCELLED,  // Hóa đơn đã hủy
    OVERDUE     // Hóa đơn quá hạn
}