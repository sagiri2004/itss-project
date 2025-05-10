package com.example.backend.controller;

import com.example.backend.dto.request.InvoiceCreateRequest;
import com.example.backend.dto.request.InvoiceUpdateRequest;
import com.example.backend.dto.request.UserConfirmPaymentRequest;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.model.enums.InvoiceStatus;
import com.example.backend.service.InvoiceService;
import com.example.backend.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller quản lý hóa đơn trong hệ thống.
 * Cung cấp các endpoints để tạo, truy xuất, cập nhật, xóa và xác nhận thanh toán hóa đơn.
 * Quyền truy cập vào các endpoints này được kiểm soát bằng xác thực dựa trên vai trò.
 */
@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Tag(name = "H.trim", description = "API quản lý hóa đơn trong hệ thống")
public class InvoiceController {

	private final InvoiceService invoiceService;
	private final JwtUtil jwtUtil;

	/**
	 * Lấy tất cả hóa đơn trong hệ thống.
	 * Endpoint này chỉ dành cho quản trị viên.
	 *
	 * @return Danh sách tất cả hóa đơn được đóng gói trong ResponseEntity
	 */
	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Lấy tất cả hóa đơn",
			description = "Lấy tất cả hóa đơn trong hệ thống. Chỉ dành cho quản trị viên.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy danh sách hóa đơn thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
		return ResponseEntity.ok(invoiceService.getAllInvoices());
	}

	/**
	 * Lấy một hóa đơn cụ thể theo ID.
	 * Endpoint này có thể được truy cập bởi quản trị viên, công ty và người dùng.
	 *
	 * @param id ID của hóa đơn
	 * @return Hóa đơn được yêu cầu được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu hóa đơn không tồn tại
	 */
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY', 'USER')")
	@Operation(summary = "Lấy hóa đơn theo ID",
			description = "Lấy một hóa đơn cụ thể bằng ID của nó",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy hóa đơn thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<InvoiceResponse> getInvoiceById(
			@Parameter(description = "ID của hóa đơn cần lấy", required = true)
			@PathVariable String id) {
		return ResponseEntity.ok(invoiceService.getInvoiceById(id));
	}

	/**
	 * Lấy hóa đơn liên quan đến một yêu cầu cứu hộ cụ thể.
	 * Endpoint này có thể được truy cập bởi quản trị viên, công ty và người dùng.
	 *
	 * @param rescueRequestId ID của yêu cầu cứu hộ
	 * @return Hóa đơn liên quan được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu không có hóa đơn nào cho yêu cầu cứu hộ
	 */
	@GetMapping("/by-rescue-request/{rescueRequestId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY', 'USER')")
	@Operation(summary = "Lấy hóa đơn theo ID yêu cầu cứu hộ",
			description = "Lấy hóa đơn liên quan đến một yêu cầu cứu hộ cụ thể",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy hóa đơn thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn hoặc yêu cầu cứu hộ")
	})
	public ResponseEntity<InvoiceResponse> getInvoiceByRescueRequest(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String rescueRequestId) {
		return ResponseEntity.ok(invoiceService.getInvoiceByRescueRequest(rescueRequestId));
	}

	/**
	 * Lấy hóa đơn theo số hóa đơn.
	 * Endpoint này chỉ dành cho quản trị viên và công ty.
	 *
	 * @param invoiceNumber Số hóa đơn duy nhất
	 * @return Hóa đơn yêu cầu được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu không có hóa đơn nào với số đã cho
	 */
	@GetMapping("/by-invoice-number/{invoiceNumber}")
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY')")
	@Operation(summary = "Lấy hóa đơn theo số hóa đơn",
			description = "Lấy hóa đơn theo số hóa đơn duy nhất của nó",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy hóa đơn thành công",
					content = @Content(mediaType = "application:Jjson",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<InvoiceResponse> getInvoiceByInvoiceNumber(
			@Parameter(description = "Số hóa đơn (ví dụ: INV-20230715-0001)", required = true)
			@PathVariable String invoiceNumber) {
		return ResponseEntity.ok(invoiceService.getInvoiceByInvoiceNumber(invoiceNumber));
	}

	/**
	 * Lấy tất cả hóa đơn liên quan đến người dùng đã xác thực hiện tại.
	 * Endpoint này dành cho người dùng để xem hóa đơn của họ.
	 *
	 * @param token Token JWT xác thực từ header Authorization
	 * @return Danh sách hóa đơn của người dùng đã xác thực, được đóng gói trong ResponseEntity
	 */
	@GetMapping("/my-invoices")
	@PreAuthorize("hasRole('USER')")
	@Operation(summary = "Lấy hóa đơn của tôi",
			description = "Lấy tất cả hóa đơn liên quan đến người dùng đã xác thực",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy hóa đơn người dùng thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getMyInvoices(
			@Parameter(description = "Token JWT với tiền tố 'Bearer '", hidden = true)
			@RequestHeader("Authorization") String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
	}

	/**
	 * Lấy tất cả hóa đơn cho một người dùng cụ thể.
	 * Endpoint này chỉ dành cho quản trị viên.
	 *
	 * @param userId ID của người dùng
	 * @return Danh sách hóa đơn cho người dùng được chỉ định, được đóng gói trong ResponseEntity
	 */
	@GetMapping("/by-user/{userId}")
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Lấy hóa đơn theo ID người dùng",
			description = "Lấy tất cả hóa đơn liên quan đến một người dùng cụ thể. Chỉ dành cho quản trị viên.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy hóa đơn người dùng thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getInvoicesByUserId(
			@Parameter(description = "ID của người dùng", required = true)
			@PathVariable String userId) {
		return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
	}

	/**
	 * Lấy tất cả hóa đơn cho một công ty cụ thể.
	 * Endpoint này chỉ dành cho quản trị viên.
	 *
	 * @param companyId ID của công ty
	 * @return Danh sách hóa đơn cho công ty được chỉ định, được đóng gói trong ResponseEntity
	 */
	@GetMapping("/by-company/{companyId}")
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Lấy hóa đơn theo ID công ty",
			description = "Lấy tất cả hóa đơn liên quan đến một công ty cụ thể. Chỉ dành cho quản trị viên.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy hóa đơn công ty thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getInvoicesByCompanyId(
			@Parameter(description = "ID của công ty", required = true)
			@PathVariable String companyId) {
		return ResponseEntity.ok(invoiceService.getInvoicesByCompanyId(companyId));
	}

	/**
	 * Lấy tất cả hóa đơn cho công ty do người dùng đã xác thực hiện tại quản lý.
	 * Endpoint này dành cho người dùng công ty để xem hóa đơn cho công ty của họ.
	 *
	 * @param token Token JWT xác thực từ header Authorization
	 * @return Danh sách hóa đơn cho công ty, được đóng gói trong ResponseEntity
	 */
	@GetMapping("/my-company-invoices")
	@PreAuthorize("hasRole('COMPANY')")
	@Operation(summary = "Lấy hóa đơn của công ty tôi",
			description = "Lấy tất cả hóa đơn cho công ty do người dùng đã xác thực quản lý",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy hóa đơn công ty thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getCompanyInvoices(
			@Parameter(description = "Token JWT với tiền tố 'Bearer '", hidden = true)
			@RequestHeader("Authorization") String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		return ResponseEntity.ok(invoiceService.getInvoicesByCompanyManagerId(userId));
	}

	/**
	 * Lấy tất cả hóa đơn có trạng thái cụ thể.
	 * Endpoint này chỉ dành cho quản trị viên.
	 *
	 * @param status Trạng thái hóa đơn để lọc
	 * @return Danh sách hóa đơn có trạng thái được chỉ định, được đóng gói trong ResponseEntity
	 */
	@GetMapping("/by-status/{status}")
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Lấy hóa đơn theo trạng thái",
			description = "Lấy tất cả hóa đơn có trạng thái cụ thể. Chỉ dành cho quản trị viên.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Lấy hóa đơn theo trạng thái thành công",
			content = @Content(mediaType = "application/json",
					array = @ArraySchema(schema = @Schema(implementation = InvoiceResponse.class))))
	public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(
			@Parameter(description = "Trạng thái hóa đơn (PENDING, PAID, OVERDUE, CANCELLED)", required = true)
			@PathVariable InvoiceStatus status) {
		return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
	}

	/**
	 * Tạo một hóa đơn mới trong hệ thống.
	 * Endpoint này chỉ dành cho quản trị viên và công ty.
	 * Hệ thống tự động tạo số hóa đơn duy nhất.
	 *
	 * @param request Yêu cầu tạo hóa đơn chứa các chi tiết cần thiết
	 * @return Hóa đơn mới được tạo được đóng gói trong ResponseEntity với trạng thái HTTP 201 (Created)
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu yêu cầu cứu hộ tham chiếu không tồn tại
	 * @throws IllegalStateException nếu hóa đơn đã tồn tại cho yêu cầu cứu hộ đã chỉ định
	 */
	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY')")
	@Operation(summary = "Tạo hóa đơn mới",
			description = "Tạo một hóa đơn mới trong hệ thống. Số hóa đơn duy nhất sẽ được tự động tạo.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Tạo hóa đơn thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu cứu hộ"),
			@ApiResponse(responseCode = "409", description = "Hóa đơn đã tồn tại cho yêu cầu cứu hộ này")
	})
	public ResponseEntity<InvoiceResponse> createInvoice(
			@Parameter(description = "Chi tiết hóa đơn", required = true)
			@RequestBody InvoiceCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(request));
	}

	/**
	 * Cập nhật một hóa đơn hiện có.
	 * Endpoint này chỉ dành cho quản trị viên và công ty.
	 *
	 * @param id ID của hóa đơn cần cập nhật
	 * @param request Yêu cầu cập nhật chứa các trường cần sửa đổi
	 * @return Hóa đơn đã cập nhật được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu hóa đơn không tồn tại
	 */
	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY')")
	@Operation(summary = "Cập nhật hóa đơn",
			description = "Cập nhật một hóa đơn hiện có",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật hóa đơn thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<InvoiceResponse> updateInvoice(
			@Parameter(description = "ID của hóa đơn cần cập nhật", required = true)
			@PathVariable String id,
			@Parameter(description = "Chi tiết hóa đơn cập nhật", required = true)
			@RequestBody InvoiceUpdateRequest request) {
		return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
	}

	/**
	 * Đánh dấu hóa đơn đã thanh toán.
	 * Endpoint này chỉ dành cho quản trị viên và công ty.
	 * Đặt trạng thái thành PAID, ghi lại ngày thanh toán và tùy chọn ghi lại phương thức thanh toán.
	 * Cũng cập nhật trạng thái yêu cầu cứu hộ liên quan.
	 *
	 * @param id ID của hóa đơn cần đánh dấu là đã thanh toán
	 * @param paymentMethod Phương thức thanh toán tùy chọn được sử dụng (tiền mặt, thẻ, chuyển khoản, v.v.)
	 * @return Hóa đơn đã cập nhật được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu hóa đơn không tồn tại
	 * @throws IllegalStateException nếu hóa đơn đã được đánh dấu là đã thanh toán
	 */
	@PutMapping("/{id}/mark-paid")
	@PreAuthorize("hasAnyRole('ADMIN', 'COMPANY')")
	@Operation(summary = "Đánh dấu hóa đơn đã thanh toán",
			description = "Đánh dấu một hóa đơn đã thanh toán, đặt ngày thanh toán và ghi lại phương thức thanh toán",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Đánh dấu hóa đơn đã thanh toán thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Hóa đơn đã được thanh toán rồi"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<InvoiceResponse> markInvoiceAsPaid(
			@Parameter(description = "ID của hóa đơn cần đánh dấu đã thanh toán", required = true)
			@PathVariable String id,
			@Parameter(description = "Phương thức thanh toán (ví dụ: tiền mặt, thẻ, chuyển khoản)")
			@RequestParam(required = false) String paymentMethod) {
		return ResponseEntity.ok(invoiceService.markInvoiceAsPaid(id, paymentMethod));
	}

	/**
	 * Xác nhận thanh toán hóa đơn bởi người dùng.
	 * Endpoint này chỉ dành cho người dùng đã xác thực.
	 * Cho phép người dùng xác nhận thanh toán hóa đơn của họ và ghi lại phương thức thanh toán.
	 *
	 * @param id ID của hóa đơn cần xác nhận thanh toán
	 * @param request Yêu cầu xác nhận thanh toán chứa thông tin phương thức thanh toán
	 * @param token Token JWT xác thực từ header Authorization
	 * @return Hóa đơn đã cập nhật được đóng gói trong ResponseEntity
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu hóa đơn không tồn tại
	 * @throws IllegalStateException nếu hóa đơn đã được thanh toán hoặc người dùng không có quyền
	 */
	@PostMapping("/{id}/pay")
	@PreAuthorize("hasRole('USER')")
	@Operation(summary = "Xác nhận thanh toán hóa đơn",
			description = "Cho phép người dùng xác nhận thanh toán hóa đơn và ghi lại phương thức thanh toán",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Xác nhận thanh toán thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = InvoiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Hóa đơn đã được thanh toán hoặc dữ liệu không hợp lệ"),
			@ApiResponse(responseCode = "403", description = "Người dùng không có quyền xác nhận thanh toán cho hóa đơn này"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<InvoiceResponse> confirmPayment(
			@Parameter(description = "ID của hóa đơn cần xác nhận thanh toán", required = true)
			@PathVariable String id,
			@Parameter(description = "Thông tin xác nhận thanh toán", required = true)
			@RequestBody UserConfirmPaymentRequest request,
			@Parameter(description = "Token JWT với tiền tố 'Bearer '", hidden = true)
			@RequestHeader("Authorization") String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		return ResponseEntity.ok(invoiceService.confirmPayment(id, userId, request));
	}

	/**
	 * Xóa một hóa đơn khỏi hệ thống.
	 * Endpoint này chỉ dành cho quản trị viên.
	 *
	 * @param id ID của hóa đơn cần xóa
	 * @return ResponseEntity trống với trạng thái HTTP 204 (No Content)
	 * @throws com.example.backend.exception.ResourceNotFoundException nếu hóa đơn không tồn tại
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Xóa hóa đơn",
			description = "Xóa một hóa đơn khỏi hệ thống. Chỉ dành cho quản trị viên.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Xóa hóa đơn thành công"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy hóa đơn")
	})
	public ResponseEntity<Void> deleteInvoice(
			@Parameter(description = "ID của hóa đơn cần xóa", required = true)
			@PathVariable String id) {
		invoiceService.deleteInvoice(id);
		return ResponseEntity.noContent().build();
	}
}