package com.example.backend.service.impl;

import com.example.backend.dto.request.RescueRequestCreateRequest;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.event.NotificationEvent;
import com.example.backend.event.enums.NotificationType;
import com.example.backend.exception.AuthException;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.exception.InvalidStatusException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.kafka.NotificationEventProducer;
import com.example.backend.model.*;
import com.example.backend.model.enums.*;
import com.example.backend.repository.*;
import com.example.backend.service.RescueRequestService;
import com.example.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RescueRequestServiceImpl implements RescueRequestService {

	private final RescueRequestRepository requestRepository;
	private final RescueServiceRepository serviceRepository;
	private final RescueCompanyRepository rescueCompanyRepository;
	private final RescueVehicleRepository rescueVehicleRepository;
	private final MessageRepository messageRepository;
	private final ConversationRepository conversationRepository;
	private final InvoiceRepository invoiceRepository;
	private final RescueVehicleDispatchRepository rescueVehicleDispatchRepository;
	private final UserRepository userRepository;
	private final NotificationEventProducer notificationEventProducer;
	private final JwtUtil jwtUtil;

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@Override
	public List<RescueRequestResponse> getUserRequests(String userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		List<RescueRequest> requests = requestRepository.findByUser(user);
		return requests.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public RescueRequestResponse createRescueRequest(RescueRequestCreateRequest request, String userId) {
		logger.info("Creating rescue request for userId: {} with serviceId: {}", userId, request.getRescueServiceId());

		User user = userRepository.findById(userId)
				.orElseThrow(() -> {
					logger.error("User not found with id: {}", userId);
					return new ResourceNotFoundException("User with ID " + userId + " does not exist");
				});
		logger.debug("Found user: {}", user.getId());

		RescueService rescueService = serviceRepository.findById(request.getRescueServiceId())
				.orElseThrow(() -> {
					logger.error("Rescue service not found with id: {}", request.getRescueServiceId());
					return new IllegalArgumentException("Rescue service with ID " + request.getRescueServiceId() + " does not exist");
				});
		logger.debug("Found rescue service: {}", rescueService.getId());

		RescueRequest rescueRequest = RescueRequest.builder()
				.user(user)
				.rescueService(rescueService)
				.company(rescueService.getCompany())
				.latitude(request.getLatitude())
				.longitude(request.getLongitude())
				.description(request.getDescription())
				.estimatedPrice(rescueService.getPrice())
				.status(RescueRequestStatus.CREATED)
				.build();

		RescueRequest saved = requestRepository.save(rescueRequest);
		logger.info("Saved rescue request with id: {}", saved.getId());

		User companyOwner = rescueService.getCompany().getUser();
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(companyOwner.getId())
				.title("Yêu cầu cứu hộ mới")
				.content("Bạn vừa nhận được một yêu cầu cứu hộ mới. Hãy kiểm tra hệ thống!")
				.type(NotificationType.RESCUE_REQUEST)
				.sentAt(LocalDateTime.now())
				.build();
		try {
			notificationEventProducer.sendNotificationEvent(event);
			logger.debug("Sent notification for rescue request: {}", saved.getId());
		} catch (Exception e) {
			logger.warn("Failed to send notification for rescue request: {}", saved.getId(), e);
		}

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse getRescueRequestById(String id, String userId) {
		logger.info("Fetching rescue request details for id: {} by userId: {}", id, userId);

		RescueRequest rescueRequest = requestRepository.findById(id)
				.orElseThrow(() -> {
					logger.error("Rescue request not found with id: {}", id);
					return new ResourceNotFoundException("Rescue request with ID " + id + " does not exist");
				});

		// Kiểm tra quyền truy cập
		User requestingUser = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " does not exist"));
		if (!rescueRequest.getUser().getId().equals(userId) && !isCompanyUser(requestingUser, rescueRequest.getCompany())) {
			logger.warn("Unauthorized access attempt to rescue request id: {} by userId: {}", id, userId);
			throw new SecurityException("You do not have permission to view this rescue request");
		}

		// Lấy thông tin RescueService
		RescueServiceResponse rescueServiceResponse = RescueServiceResponse.builder()
				.id(rescueRequest.getRescueService().getId())
				.name(rescueRequest.getRescueService().getName())
				.description(rescueRequest.getRescueService().getDescription())
				.price(rescueRequest.getRescueService().getPrice())
				.type(rescueRequest.getRescueService().getType())
				.companyId(rescueRequest.getCompany().getId())
				.companyName(rescueRequest.getCompany().getName())
				.build();

		RescueVehicleDispatch dispatch = rescueVehicleDispatchRepository.findByRescueRequestId(rescueRequest.getId());

		// Lấy thông tin RescueVehicle (nếu có)
		String vehicleLicensePlate = null;
		String vehicleModel = null;
		List<RescueEquipment> vehicleEquipmentDetails = null;
		RescueVehicleStatus vehicleStatus = null;

		if (dispatch != null) {
			// Lấy thông tin RescueVehicle (nếu có)
			String vehicleId = dispatch.getRescueVehicle().getId();
			if (vehicleId != null) {
				RescueVehicle vehicle = rescueVehicleRepository.findById(vehicleId).orElse(null);
				logger.info("Rescue vehicle found for id: {} by userId: {}", vehicle.getId(), vehicle);
				if (vehicle != null) {
					vehicleLicensePlate = vehicle.getLicensePlate();
					vehicleModel = vehicle.getModel();
					vehicleEquipmentDetails = vehicle.getEquipmentDetails();
					vehicleStatus = vehicle.getStatus();
				}
			}
		}

//		logger.info("Rescue request details fetched successfully for id: {} by userId: {}", dispatch.getId(), dispatch);

		return RescueRequestResponse.builder()
				.id(rescueRequest.getId())
				.userId(rescueRequest.getUser().getId())
				.serviceId(rescueRequest.getRescueService().getId())
				.serviceName(rescueRequest.getRescueService().getName())
				.companyId(rescueRequest.getCompany().getId())
				.companyName(rescueRequest.getCompany().getName())
				.latitude(rescueRequest.getLatitude())
				.longitude(rescueRequest.getLongitude())
				.description(rescueRequest.getDescription())
				.estimatedPrice(rescueRequest.getEstimatedPrice())
				.finalPrice(rescueRequest.getFinalPrice()) // Giả định có trong model
				.status(rescueRequest.getStatus())
				.createdAt(rescueRequest.getCreatedAt())
				.notes(rescueRequest.getNotes()) // Giả định có trong model
				.rescueServiceDetails(rescueServiceResponse)
				.vehicleLicensePlate(vehicleLicensePlate)
				.vehicleModel(vehicleModel)
				.vehicleEquipmentDetails(vehicleEquipmentDetails)
				.vehicleStatus(vehicleStatus)
				.build();
	}

	// Helper method để kiểm tra xem user có phải là chủ sở hữu công ty liên quan không
	private boolean isCompanyUser(User user, RescueCompany company) {
		return company != null && company.getUser() != null && company.getUser().getId().equals(user.getId());
	}


	@Override
	@PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
	public List<RescueRequestResponse> getRequestsForCompany(String token, RescueRequestStatus status) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		List<RescueService> services = serviceRepository.findByCompanyId(company.getId());

		if (services.isEmpty()) return List.of();

		List<RescueRequest> requests;
		if (status != null) {
			requests = requestRepository.findByRescueServiceInAndStatus(services, status);
		} else {
			requests = requestRepository.findByRescueServiceIn(services);
		}

		return requests.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public RescueRequestResponse acceptRequest(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền tiếp nhận yêu cầu này");
		}

		request.setStatus(RescueRequestStatus.ACCEPTED_BY_COMPANY);
		RescueRequest saved = requestRepository.save(request);

		// --- Tạo conversation và gửi tin nhắn chào ---
		User user = request.getUser();
		// 1. Kiểm tra đã có conversation chưa
		Conversation conversation = conversationRepository.findByUserIdAndRescueCompanyId(user.getId(), company.getId())
				.orElse(null);
		if (conversation == null) {
			conversation = Conversation.builder()
					.user(user)
					.rescueCompany(company)
					.createdAt(LocalDateTime.now())
					.build();
			conversation = conversationRepository.save(conversation);
		}

		// 2. Tạo message chào
		Message welcomeMsg = Message.builder()
				.conversation(conversation)
				.senderType(MessageSender.RESCUE_COMPANY)
				.content("Xin chào, chúng tôi đã tiếp nhận yêu cầu cứu hộ của bạn. Vui lòng giữ liên lạc để được hỗ trợ nhanh nhất!")
				.sentAt(LocalDateTime.now())
				.isRead(false)
				.build();
		messageRepository.save(welcomeMsg);

		// (Nếu có hệ thống WebSocket/chat realtime, có thể publish message này tại đây)

		// --- Gửi notification như cũ ---
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Yêu cầu được tiếp nhận")
				.content("Yêu cầu cứu hộ của bạn đã được công ty tiếp nhận.")
				.type(NotificationType.REQUEST_ACCEPTED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);

		// --- Gui them message chào ---
		NotificationEvent welcomeMsgEvent = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Chào mừng bạn đã được tiếp nhận yêu cầu cứu hộ")
				.content(welcomeMsg.getContent())
				.type(NotificationType.CHAT)
				.conversationId(conversation.getId())
				.sentAt(LocalDateTime.now())
				.build();

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse cancelByUser(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		if (!request.getUser().getId().equals(userId)) {
			throw new AuthException("Bạn không phải người tạo yêu cầu này");
		}

		if (request.getStatus() == RescueRequestStatus.IN_PROGRESS ||
				request.getStatus() == RescueRequestStatus.COMPLETED ||
				request.getStatus() == RescueRequestStatus.INVOICED ||
				request.getStatus() == RescueRequestStatus.PAID) {
			throw new InvalidStatusException("Không thể hủy yêu cầu ở trạng thái này");
		}

		RescueRequestStatus currentStatus = request.getStatus();
		request.setStatus(RescueRequestStatus.CANCELLED_BY_USER);

		try {
			// Lấy danh sách xe được điều động cho yêu cầu này
			List<RescueVehicleDispatch> dispatches = rescueVehicleDispatchRepository.findByRescueRequest(request);

			// Cập nhật trạng thái của các lệnh điều động và trạng thái của xe
			for (RescueVehicleDispatch dispatch : dispatches) {
				// Cập nhật trạng thái điều động thành CANCELLED
				dispatch.setStatus(RescueVehicleDispatchStatus.CANCELLED);
				rescueVehicleDispatchRepository.save(dispatch);

				// Cập nhật trạng thái xe thành AVAILABLE
				RescueVehicle vehicle = dispatch.getRescueVehicle();
				vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
				rescueVehicleRepository.save(vehicle);
			}

			// Lưu yêu cầu với trạng thái mới
			RescueRequest saved = requestRepository.save(request);

			// Thông báo cho công ty cứu hộ về việc hủy
			if (saved.getRescueService() != null && saved.getRescueService().getCompany() != null
					&& saved.getRescueService().getCompany().getUser() != null) {
				NotificationEvent event = NotificationEvent.builder()
						.recipientId(saved.getRescueService().getCompany().getUser().getId())
						.title("Yêu cầu bị hủy")
						.content("Người dùng đã hủy yêu cầu cứu hộ.")
						.type(NotificationType.REQUEST_CANCELED)
						.sentAt(LocalDateTime.now())
						.build();
				notificationEventProducer.sendNotificationEvent(event);


			}

			return toResponse(saved);
		} catch (Exception e) {
			request.setStatus(currentStatus); // Khôi phục trạng thái ban đầu nếu có lỗi
			throw e;
		}
	}

	@Override
	public RescueRequestResponse cancelByCompany(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền hủy yêu cầu này");
		}

		RescueRequestStatus currentStatus = request.getStatus();
		if (currentStatus == RescueRequestStatus.IN_PROGRESS ||
				currentStatus == RescueRequestStatus.COMPLETED ||
				currentStatus == RescueRequestStatus.INVOICED ||
				currentStatus == RescueRequestStatus.PAID) {
			throw new InvalidStatusException("Không thể hủy yêu cầu ở trạng thái này");
		}

		request.setStatus(RescueRequestStatus.CANCELLED_BY_COMPANY);
		try {
			// Lấy danh sách xe được điều động cho yêu cầu này
			List<RescueVehicleDispatch> dispatches = rescueVehicleDispatchRepository.findByRescueRequest(request);

			// Cập nhật trạng thái của các lệnh điều động và trạng thái của xe
			for (RescueVehicleDispatch dispatch : dispatches) {
				// Cập nhật trạng thái điều động thành CANCELLED
				dispatch.setStatus(RescueVehicleDispatchStatus.CANCELLED);
				rescueVehicleDispatchRepository.save(dispatch);

				// Cập nhật trạng thái xe thành AVAILABLE
				RescueVehicle vehicle = dispatch.getRescueVehicle();
				vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
				rescueVehicleRepository.save(vehicle);
			}

			// Lưu yêu cầu với trạng thái mới
			RescueRequest saved = requestRepository.save(request);

			NotificationEvent event = NotificationEvent.builder()
					.recipientId(request.getUser().getId())
					.title("Yêu cầu bị hủy")
					.content("Công ty cứu hộ đã hủy yêu cầu của bạn.")
					.type(NotificationType.REQUEST_CANCELED)
					.sentAt(LocalDateTime.now())
					.build();
			notificationEventProducer.sendNotificationEvent(event);



			return toResponse(saved);
		} catch (Exception e) {
			request.setStatus(currentStatus); // Revert to original status
			throw e;
		}
	}

	@Override
	public RescueRequestResponse dispatchRescueVehicle(String requestId, String vehicleId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		if (request.getStatus() != RescueRequestStatus.ACCEPTED_BY_COMPANY) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái được tiếp nhận trước khi điều xe");
		}

		RescueVehicle vehicle = rescueVehicleRepository.findById(vehicleId)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe cứu hộ"));

		// Kiểm tra xe thuộc công ty
		if (!vehicle.getCompany().getId().equals(company.getId())) {
			throw new AuthException("Xe cứu hộ không thuộc công ty của bạn");
		}

		// Kiểm tra trạng thái xe
		if (vehicle.getStatus() != RescueVehicleStatus.AVAILABLE) {
			throw new InvalidStatusException("Xe cứu hộ này không khả dụng để điều động");
		}

		// Kiểm tra xe đã được dispatched đến request này chưa
		if (rescueVehicleDispatchRepository.existsByRescueRequestAndRescueVehicle(request, vehicle)) {
			throw new InvalidStatusException("Xe này đã được điều động cho yêu cầu cứu hộ này");
		}

		try {
			// Cập nhật trạng thái xe
			vehicle.setStatus(RescueVehicleStatus.ON_DUTY);
			rescueVehicleRepository.save(vehicle);

			// Tạo dispatch record
			RescueVehicleDispatch dispatch = RescueVehicleDispatch.builder()
					.rescueRequest(request)
					.rescueVehicle(vehicle)
					.status(RescueVehicleDispatchStatus.DISPATCHED)
					.build();
			rescueVehicleDispatchRepository.save(dispatch);

			// Cập nhật trạng thái request
			request.setStatus(RescueRequestStatus.RESCUE_VEHICLE_DISPATCHED);
			RescueRequest saved = requestRepository.save(request);

			NotificationEvent event = NotificationEvent.builder()
					.recipientId(request.getUser().getId())
					.title("Xe cứu hộ đang được điều động")
					.content("Xe cứu hộ đang được điều động đến vị trí của bạn.")
					.type(NotificationType.VEHICLE_DISPATCHED)
					.sentAt(LocalDateTime.now())
					.build();
			notificationEventProducer.sendNotificationEvent(event);


			return toResponse(saved);
		} catch (Exception e) {
			// Trong trường hợp có lỗi, khôi phục trạng thái ban đầu
			request.setStatus(RescueRequestStatus.ACCEPTED_BY_COMPANY);

			// Nếu đã cập nhật trạng thái xe, khôi phục lại
			try {
				vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
				rescueVehicleRepository.save(vehicle);
			} catch (Exception ex) {
				// Ghi log nếu không thể khôi phục trạng thái xe
			}
			throw e;
		}
	}

	@Override
	public RescueRequestResponse markVehicleArrived(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		if (request.getStatus() != RescueRequestStatus.RESCUE_VEHICLE_DISPATCHED) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đã điều động xe trước khi đánh dấu xe đã đến nơi");
		}

		// Cập nhật trạng thái request
		request.setStatus(RescueRequestStatus.RESCUE_VEHICLE_ARRIVED);
		RescueRequest saved = requestRepository.save(request);

		// Cập nhật thông tin trong bảng dispatch
		List<RescueVehicleDispatch> dispatches = rescueVehicleDispatchRepository.findByRescueRequest(request);
		if (!dispatches.isEmpty()) {
			// Cập nhật thời gian đến nơi cho xe được dispatch
			RescueVehicleDispatch dispatch = dispatches.get(0);
			dispatch.setArrivedAt(LocalDateTime.now());
			dispatch.setStatus(RescueVehicleDispatchStatus.ARRIVED);
			rescueVehicleDispatchRepository.save(dispatch);
		}

		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Xe cứu hộ đã đến")
				.content("Xe cứu hộ đã đến vị trí của bạn. Đội kỹ thuật sẽ kiểm tra tình trạng xe.")
				.type(NotificationType.VEHICLE_ARRIVED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse markInspectionDone(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		if (request.getStatus() != RescueRequestStatus.RESCUE_VEHICLE_ARRIVED) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái xe đã đến nơi trước khi hoàn tất kiểm tra");
		}

		// Cập nhật trạng thái request
		request.setStatus(RescueRequestStatus.INSPECTION_DONE);
		RescueRequest saved = requestRepository.save(request);

		// Gửi thông báo cho người dùng
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Kiểm tra xe hoàn tất")
				.content("Đội kỹ thuật đã hoàn tất kiểm tra xe của bạn.")
				.type(NotificationType.INSPECTION_COMPLETED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse updatePrice(String requestId, Double newPrice, String notes, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);

		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}

		RescueCompany company = companies.get(0);

		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		if (request.getStatus() != RescueRequestStatus.INSPECTION_DONE) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đã kiểm tra xe trước khi cập nhật giá");
		}

		if (newPrice == null || newPrice <= 0) {
			throw new IllegalArgumentException("Giá mới phải lớn hơn 0");
		}

		// Cập nhật trạng thái và giá mới
		request.setStatus(RescueRequestStatus.PRICE_UPDATED);
		request.setFinalPrice(newPrice);

		// Cập nhật ghi chú nếu có
		if (notes != null && !notes.trim().isEmpty()) {
			request.setNotes(notes);
		}

		RescueRequest saved = requestRepository.save(request);

		// Gửi thông báo cho người dùng
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Báo giá mới")
				.content("Công ty cứu hộ đã cập nhật báo giá cho dịch vụ. Vui lòng kiểm tra.")
				.type(NotificationType.PRICE_UPDATED)
				.sentAt(LocalDateTime.now())
				.additionalData(Map.of("price", newPrice, "notes", notes != null ? notes : ""))
				.build();
		notificationEventProducer.sendNotificationEvent(event);


		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse confirmPrice(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		// Validate user owns this request
		if (!request.getUser().getId().equals(userId)) {
			throw new AuthException("Bạn không phải người tạo yêu cầu này");
		}

		// Validate current status
		if (request.getStatus() != RescueRequestStatus.PRICE_UPDATED) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đã cập nhật giá trước khi xác nhận");
		}

		// Update request status
		request.setStatus(RescueRequestStatus.PRICE_CONFIRMED);
		RescueRequest saved = requestRepository.save(request);

		// Send notification to company
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getRescueService().getCompany().getUser().getId())
				.title("Báo giá được chấp nhận")
				.content("Khách hàng đã chấp nhận báo giá dịch vụ.")
				.type(NotificationType.PRICE_CONFIRMED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);


		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse rejectPrice(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		// Validate user owns this request
		if (!request.getUser().getId().equals(userId)) {
			throw new AuthException("Bạn không phải người tạo yêu cầu này");
		}

		// Validate current status
		if (request.getStatus() != RescueRequestStatus.PRICE_UPDATED) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đã cập nhật giá trước khi từ chối");
		}

		// Update request status
		request.setStatus(RescueRequestStatus.REJECTED_BY_USER);
		RescueRequest saved = requestRepository.save(request);

		// Free up vehicles
		List<RescueVehicleDispatch> dispatches = rescueVehicleDispatchRepository.findByRescueRequest(request);
		for (RescueVehicleDispatch dispatch : dispatches) {
			RescueVehicle vehicle = dispatch.getRescueVehicle();
			vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
			rescueVehicleRepository.save(vehicle);

			dispatch.setStatus(RescueVehicleDispatchStatus.CANCELLED);
			rescueVehicleDispatchRepository.save(dispatch);
		}

		// Send notification to company
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getRescueService().getCompany().getUser().getId())
				.title("Báo giá bị từ chối")
				.content("Khách hàng đã từ chối báo giá dịch vụ.")
				.type(NotificationType.PRICE_REJECTED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse startRepair(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);
		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}
		RescueCompany company = companies.get(0);

		// Validate company owns this request
		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		// Validate current status
		if (request.getStatus() != RescueRequestStatus.PRICE_CONFIRMED) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đã xác nhận giá trước khi bắt đầu sửa chữa");
		}

		// Update request status
		request.setStatus(RescueRequestStatus.IN_PROGRESS);
		RescueRequest saved = requestRepository.save(request);

		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Bắt đầu sửa chữa")
				.content("Đội kỹ thuật đã bắt đầu tiến hành sửa chữa xe của bạn.")
				.type(NotificationType.REPAIR_STARTED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);

		return toResponse(saved);
	}

	@Override
	public RescueRequestResponse completeRepair(String requestId, String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		RescueRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResourceNotFoundException("RescueRequest not found"));

		List<RescueCompany> companies = rescueCompanyRepository.findAllByUserId(userId);
		if (companies.isEmpty()) {
			throw new ResourceNotFoundException("Không tìm thấy công ty do bạn quản lý");
		}
		RescueCompany company = companies.get(0);

		// Validate company owns this request
		if (!request.getRescueService().getCompany().getId().equals(company.getId())) {
			throw new AuthException("Bạn không có quyền thực hiện yêu cầu này");
		}

		// Validate current status
		if (request.getStatus() != RescueRequestStatus.IN_PROGRESS) {
			throw new InvalidStatusException("Yêu cầu phải ở trạng thái đang sửa chữa trước khi hoàn tất sửa chữa");
		}

		// Check if invoice already exists for this request
		if (invoiceRepository.existsByRescueRequest(request)) {
			throw new InvalidStatusException("Hóa đơn đã tồn tại cho yêu cầu này");
		}

		// Update request status to COMPLETED
		request.setStatus(RescueRequestStatus.COMPLETED);
		RescueRequest saved = requestRepository.save(request);

		// Free up dispatched vehicles
		List<RescueVehicleDispatch> dispatches = rescueVehicleDispatchRepository.findByRescueRequest(request);
		for (RescueVehicleDispatch dispatch : dispatches) {
			RescueVehicle vehicle = dispatch.getRescueVehicle();
			vehicle.setStatus(RescueVehicleStatus.AVAILABLE);
			rescueVehicleRepository.save(vehicle);

			dispatch.setStatus(RescueVehicleDispatchStatus.COMPLETED);
			dispatch.setCompletedAt(LocalDateTime.now());
			rescueVehicleDispatchRepository.save(dispatch);
		}

		// Create invoice
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime dueDate = now.plusDays(7); // Due in 7 days

		// Generate invoice number (format: INV-YYYYMMDD-XXXX where XXXX is a sequential number)
		String dateStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String invoiceNumber = "INV-" + dateStr + "-" + String.format("%04d", getNextInvoiceSequence());

		Invoice invoice = Invoice.builder()
				.rescueRequest(request)
				.amount(request.getFinalPrice())
				.invoiceNumber(invoiceNumber)
				.invoiceDate(now)
				.dueDate(dueDate)
				.status(InvoiceStatus.PENDING)
				.notes("Hóa đơn cho dịch vụ cứu hộ và sửa chữa xe")
				.build();

		invoiceRepository.save(invoice);

		// Update request status to INVOICED
		request.setStatus(RescueRequestStatus.INVOICED);
		saved = requestRepository.save(request);

		// Send notification to user
		NotificationEvent event = NotificationEvent.builder()
				.recipientId(request.getUser().getId())
				.title("Sửa chữa hoàn tất")
				.content("Xe của bạn đã được sửa chữa xong.")
				.type(NotificationType.REPAIR_COMPLETED)
				.sentAt(LocalDateTime.now())
				.build();
		notificationEventProducer.sendNotificationEvent(event);


		return toResponse(saved);
	}

	// Helper method to get the next invoice sequence number
	private int getNextInvoiceSequence() {
		// You could implement this using a database sequence or a counter table
		// For simplicity, we'll just count existing invoices and add 1
		long count = invoiceRepository.count();
		return (int) count + 1;
	}


	private RescueRequestResponse toResponse(RescueRequest request) {
		RescueRequestResponse.RescueRequestResponseBuilder builder = RescueRequestResponse.builder()
				.id(request.getId())
				.userId(request.getUser().getId())
				.serviceId(request.getRescueService().getId())
				.serviceName(request.getRescueService().getName())
				.companyId(request.getRescueService().getCompany().getId())
				.companyName(request.getRescueService().getCompany().getName())
				.latitude(request.getLatitude())
				.longitude(request.getLongitude())
				.description(request.getDescription())
				.estimatedPrice(request.getEstimatedPrice())
				.finalPrice(request.getFinalPrice())
				.status(request.getStatus())
				.createdAt(request.getCreatedAt());

		// Add notes if they exist
		if (request.getNotes() != null && !request.getNotes().isEmpty()) {
			builder.notes(request.getNotes());
		}

		return builder.build();
	}

	private InvoiceResponse toInvoiceResponse(Invoice invoice) {
		return InvoiceResponse.builder()
				.id(invoice.getId())
				.rescueRequestId(invoice.getRescueRequest().getId())
				.invoiceNumber(invoice.getInvoiceNumber())
				.amount(invoice.getAmount())
				.invoiceDate(invoice.getInvoiceDate())
				.dueDate(invoice.getDueDate())
				.paidDate(invoice.getPaidDate())
				.status(invoice.getStatus())
				.paymentMethod(invoice.getPaymentMethod())
				.notes(invoice.getNotes())
				.createdAt(invoice.getCreatedAt())
				.build();
	}
}