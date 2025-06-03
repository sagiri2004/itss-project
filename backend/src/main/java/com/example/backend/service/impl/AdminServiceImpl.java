package com.example.backend.service.impl;

import com.example.backend.dto.response.RescueCompanyResponse;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.backend.model.enums.ReportType;
import com.example.backend.model.enums.ReportStatus;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.CompanyRating;
import com.example.backend.repository.CompanyRatingRepository;
import com.example.backend.repository.TopicRepository;
import com.example.backend.repository.TopicCommentRepository;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.dto.response.InvoiceResponse;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.dto.response.CompanyRatingResponse;
import java.util.stream.Collectors;
import com.example.backend.dto.response.RescueVehicleResponse;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.DoubleSummaryStatistics;
import org.springframework.kafka.core.KafkaTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.backend.kafka.OnlineUserEventService;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final RescueCompanyRepository companyRepository;
    private final InvoiceRepository invoiceRepository;
    private final RescueRequestRepository requestRepository;
    private final KeywordRepository keywordRepository;
    private final ReportRepository reportRepository;
    private final CompanyRatingRepository companyRatingRepository;
    private final TopicRepository topicRepository;
    private final TopicCommentRepository topicCommentRepository;
    private final RescueVehicleRepository vehicleRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);
    private final OnlineUserEventService onlineUserEventService;

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    // User
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRoles().stream().findFirst().map(Enum::name).orElse(null))
                .build())
            .collect(Collectors.toList());
    }
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow();
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRoles().stream().findFirst().map(Enum::name).orElse(null))
            .build();
    }
    public UserResponse updateUser(String id, User user) {
        user.setId(id);
        User saved = userRepository.save(user);
        return UserResponse.builder()
            .id(saved.getId())
            .username(saved.getUsername())
            .name(saved.getName())
            .email(saved.getEmail())
            .role(saved.getRoles().stream().findFirst().map(Enum::name).orElse(null))
            .build();
    }
    public void deleteUser(String id) { userRepository.deleteById(id); }
    // Company
    public List<RescueCompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
            .map(company -> RescueCompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .phone(company.getPhone())
                .description(company.getDescription())
                .address(company.getAddress())
                .latitude(company.getLatitude())
                .longitude(company.getLongitude())
                .userId(company.getUser() != null ? company.getUser().getId() : null)
                .build())
            .collect(Collectors.toList());
    }
    public RescueCompany getCompanyById(String id) { return companyRepository.findById(id).orElseThrow(); }
    public RescueCompany updateCompany(String id, RescueCompany company) { company.setId(id); return companyRepository.save(company); }
    public void deleteCompany(String id) { companyRepository.deleteById(id); }
    // Invoice
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
            .map(invoice -> InvoiceResponse.builder()
                .id(invoice.getId())
                .rescueRequestId(invoice.getRescueRequest() != null ? invoice.getRescueRequest().getId() : null)
                .invoiceNumber(invoice.getInvoiceNumber())
                .amount(invoice.getAmount())
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .paidDate(invoice.getPaidDate())
                .status(invoice.getStatus())
                .paymentMethod(invoice.getPaymentMethod())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }
    public Invoice getInvoiceById(String id) { return invoiceRepository.findById(id).orElseThrow(); }
    public Invoice updateInvoice(String id, Invoice invoice) { invoice.setId(id); return invoiceRepository.save(invoice); }
    public void deleteInvoice(String id) { invoiceRepository.deleteById(id); }
    // Request
    public List<RescueRequestResponse> getAllRequests() {
        return requestRepository.findAll().stream()
            .map(request -> RescueRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUser() != null ? request.getUser().getId() : null)
                .companyId(request.getCompany() != null ? request.getCompany().getId() : null)
                .companyName(request.getCompany() != null ? request.getCompany().getName() : null)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .estimatedPrice(request.getEstimatedPrice())
                .finalPrice(request.getFinalPrice())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .notes(request.getNotes())
                .build())
            .collect(Collectors.toList());
    }
    public RescueRequest getRequestById(String id) { return requestRepository.findById(id).orElseThrow(); }
    public RescueRequest updateRequest(String id, RescueRequest req) { req.setId(id); return requestRepository.save(req); }
    public void deleteRequest(String id) { requestRepository.deleteById(id); }
    // Keyword
    public List<Keyword> getAllKeywords() { return keywordRepository.findAll(); }
    public Keyword addKeyword(Keyword keyword) { return keywordRepository.save(keyword); }
    public void deleteKeyword(String id) { keywordRepository.deleteById(id); }
    // Report (topic, comment, generic)
    public List<Report> getTopicReports(ReportStatus status) {
        return status != null ? reportRepository.findByTypeAndStatus(ReportType.TOPIC, status) : reportRepository.findByType(ReportType.TOPIC);
    }
    public void deleteTopicReport(String id) { reportRepository.deleteById(id); }
    public List<Report> getCommentReports(ReportStatus status) {
        return status != null ? reportRepository.findByTypeAndStatus(ReportType.COMMENT, status) : reportRepository.findByType(ReportType.COMMENT);
    }
    public void deleteCommentReport(String id) { reportRepository.deleteById(id); }
    public List<Report> getReports(ReportType type, ReportStatus status) {
        if (type != null && status != null) return reportRepository.findByTypeAndStatus(type, status);
        if (type != null) return reportRepository.findByType(type);
        if (status != null) return reportRepository.findByStatus(status);
        return reportRepository.findAll();
    }
    public Report resolveReport(ResolveReportRequest request, String adminId) {
        Report report = reportRepository.findById(request.getReportId()).orElseThrow();
        report.setStatus(request.getStatus());
        report.setResolutionNote(request.getResolutionNote());
        report.setResolvedBy(adminId);
        return reportRepository.save(report);
    }
    public List<Object[]> getTopReported(ReportType type, int limit) {
        List<Object[]> all = reportRepository.findTopReportedByType(type);
        return all.stream().limit(limit).toList();
    }
    public void deleteReport(String id) { reportRepository.deleteById(id); }
    // Rating (thay cho review)
    public List<CompanyRatingResponse> getAllRatings() {
        return companyRatingRepository.findAll().stream()
            .map(rating -> CompanyRatingResponse.builder()
                .id(rating.getId())
                .companyId(rating.getCompany() != null ? rating.getCompany().getId() : null)
                .companyName(rating.getCompany() != null ? rating.getCompany().getName() : null)
                .serviceId(rating.getService() != null ? rating.getService().getId() : null)
                .serviceName(rating.getService() != null ? rating.getService().getName() : null)
                .userId(rating.getUser() != null ? rating.getUser().getId() : null)
                .userName(rating.getUser() != null ? rating.getUser().getName() : null)
                .stars(rating.getStars())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
    }
    public void deleteRating(String id) { companyRatingRepository.deleteById(id); }
    // Keyword filter
    public List<Topic> findTopicsByKeyword(String keyword) {
        return topicRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword);
    }
    public List<TopicComment> findCommentsByKeyword(String keyword) {
        return topicCommentRepository.findByContentContainingIgnoreCase(keyword);
    }
    public List<CompanyRatingResponse> findRatingsByKeyword(String keyword) {
        return companyRatingRepository.findByCommentContainingIgnoreCase(keyword).stream()
            .map(rating -> CompanyRatingResponse.builder()
                .id(rating.getId())
                .companyId(rating.getCompany() != null ? rating.getCompany().getId() : null)
                .companyName(rating.getCompany() != null ? rating.getCompany().getName() : null)
                .serviceId(rating.getService() != null ? rating.getService().getId() : null)
                .serviceName(rating.getService() != null ? rating.getService().getName() : null)
                .userId(rating.getUser() != null ? rating.getUser().getId() : null)
                .userName(rating.getUser() != null ? rating.getUser().getName() : null)
                .stars(rating.getStars())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
    }
    public List<RescueVehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
            .map(vehicle -> RescueVehicleResponse.builder()
                .id(vehicle.getId())
                .name(vehicle.getName())
                .licensePlate(vehicle.getLicensePlate())
                .model(vehicle.getModel())
                .make(vehicle.getMake())
                .equipmentDetails(vehicle.getEquipmentDetails())
                .status(vehicle.getStatus())
                .currentLatitude(vehicle.getCurrentLatitude())
                .currentLongitude(vehicle.getCurrentLongitude())
                .assignedDriverName(vehicle.getAssignedDriverName())
                .companyId(vehicle.getCompany() != null ? vehicle.getCompany().getId() : null)
                .companyName(vehicle.getCompany() != null ? vehicle.getCompany().getName() : null)
                .lastMaintenanceDate(vehicle.getLastMaintenanceDate())
                .nextMaintenanceDate(vehicle.getNextMaintenanceDate())
                .build())
            .collect(java.util.stream.Collectors.toList());
    }
    public RescueVehicleResponse getVehicleById(String id) {
        RescueVehicle vehicle = vehicleRepository.findById(id).orElseThrow();
        return RescueVehicleResponse.builder()
            .id(vehicle.getId())
            .name(vehicle.getName())
            .licensePlate(vehicle.getLicensePlate())
            .model(vehicle.getModel())
            .make(vehicle.getMake())
            .equipmentDetails(vehicle.getEquipmentDetails())
            .status(vehicle.getStatus())
            .currentLatitude(vehicle.getCurrentLatitude())
            .currentLongitude(vehicle.getCurrentLongitude())
            .assignedDriverName(vehicle.getAssignedDriverName())
            .companyId(vehicle.getCompany() != null ? vehicle.getCompany().getId() : null)
            .companyName(vehicle.getCompany() != null ? vehicle.getCompany().getName() : null)
            .lastMaintenanceDate(vehicle.getLastMaintenanceDate())
            .nextMaintenanceDate(vehicle.getNextMaintenanceDate())
            .build();
    }
    public void deleteVehicle(String id) {
        vehicleRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getRequestStats(String timeRange, boolean groupByStatus) {
        LocalDateTime startDate = getStartDate(timeRange);
        List<RescueRequest> requests = requestRepository.findByCreatedAtAfter(startDate);

        if (groupByStatus) {
            Map<String, Long> requestsByStatus = requests.stream()
                .collect(Collectors.groupingBy(
                    req -> req.getStatus().name(),
                    Collectors.counting()
                ));

            Map<String, Object> result = new HashMap<>();
            result.put("total", requests.size());
            result.put("byStatus", requestsByStatus);
            result.put("byTime", getTimeSeriesData(requests, timeRange));
            return result;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", requests.size());
        result.put("byTime", getTimeSeriesData(requests, timeRange));
        return result;
    }

    @Override
    public Map<String, Object> getServiceUsageStats(String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        List<RescueRequest> requests = requestRepository.findByCreatedAtAfter(startDate);

        // Group by service
        Map<String, Long> serviceCounts = requests.stream()
            .filter(req -> req.getRescueService() != null)
            .collect(Collectors.groupingBy(
                req -> req.getRescueService().getName(),
                Collectors.counting()
            ));

        Map<String, Object> result = new HashMap<>();
        result.put("byService", serviceCounts.entrySet().stream()
            .map(e -> {
                Map<String, Object> serviceData = new HashMap<>();
                serviceData.put("name", e.getKey());
                serviceData.put("value", e.getValue());
                return serviceData;
            })
            .collect(Collectors.toList()));
        result.put("byTime", getServiceTimeSeriesData(requests, timeRange));
        return result;
    }

    @Override
    public Map<String, Object> getSatisfactionStats(String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        List<CompanyRating> ratings = companyRatingRepository.findByCreatedAtAfter(startDate);

        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", ratings.stream()
            .mapToDouble(CompanyRating::getStars)
            .average()
            .orElse(0.0));
        result.put("byRating", ratings.stream()
            .collect(Collectors.groupingBy(
                rating -> String.valueOf(rating.getStars()),
                Collectors.counting()
            )));
        result.put("byTime", getRatingTimeSeriesData(ratings, timeRange));
        return result;
    }

    @Override
    public Map<String, Object> getTopRatedServices(String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        List<CompanyRating> ratings = companyRatingRepository.findByCreatedAtAfter(startDate);

        Map<String, Object> result = new HashMap<>();
        result.put("services", ratings.stream()
            .filter(rating -> rating.getService() != null)
            .collect(Collectors.groupingBy(
                rating -> rating.getService().getName(),
                Collectors.collectingAndThen(
                    Collectors.toList(),
                    list -> Map.of(
                        "averageRating", list.stream().mapToDouble(CompanyRating::getStars).average().orElse(0.0),
                        "totalRatings", list.size()
                    )
                )
            )));
        result.put("byTime", getRatingTimeSeriesData(ratings, timeRange));
        return result;
    }

    private LocalDateTime getStartDate(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        return switch (timeRange.toLowerCase()) {
            case "day" -> now.minus(1, ChronoUnit.DAYS);
            case "week" -> now.minus(1, ChronoUnit.WEEKS);
            case "year" -> now.minus(1, ChronoUnit.YEARS);
            default -> now.minus(1, ChronoUnit.MONTHS); // month
        };
    }

    private List<Map<String, Object>> getTimeSeriesData(List<RescueRequest> requests, String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        Map<String, Long> counts = requests.stream()
            .collect(Collectors.groupingBy(
                req -> formatDate(req.getCreatedAt(), timeRange),
                Collectors.counting()
            ));

        return generateTimeSeries(startDate, timeRange).stream()
            .map(date -> {
                Map<String, Object> data = new HashMap<>();
                data.put("period", date);
                data.put("count", counts.getOrDefault(date, 0L));
                return data;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getServiceTimeSeriesData(List<RescueRequest> requests, String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        Map<String, Map<String, Long>> serviceCountsByTime = requests.stream()
            .filter(req -> req.getRescueService() != null)
            .collect(Collectors.groupingBy(
                req -> formatDate(req.getCreatedAt(), timeRange),
                Collectors.groupingBy(
                    req -> req.getRescueService().getName(),
                    Collectors.counting()
                )
            ));

        return generateTimeSeries(startDate, timeRange).stream()
            .map(date -> {
                Map<String, Object> data = new HashMap<>();
                data.put("period", date);
                data.put("services", serviceCountsByTime.getOrDefault(date, new HashMap<>()));
                return data;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getRatingTimeSeriesData(List<CompanyRating> ratings, String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        Map<String, DoubleSummaryStatistics> ratingStatsByTime = ratings.stream()
            .collect(Collectors.groupingBy(
                rating -> formatDate(rating.getCreatedAt(), timeRange),
                Collectors.summarizingDouble(CompanyRating::getStars)
            ));

        return generateTimeSeries(startDate, timeRange).stream()
            .map(date -> {
                DoubleSummaryStatistics stats = ratingStatsByTime.getOrDefault(date, new DoubleSummaryStatistics());
                Map<String, Object> data = new HashMap<>();
                data.put("period", date);
                data.put("averageRating", stats.getAverage());
                data.put("totalReviews", stats.getCount());
                return data;
            })
            .collect(Collectors.toList());
    }

    private List<String> generateTimeSeries(LocalDateTime startDate, String timeRange) {
        List<String> result = new ArrayList<>();
        LocalDateTime current = startDate;
        LocalDateTime end = LocalDateTime.now();

        while (!current.isAfter(end)) {
            result.add(formatDate(current, timeRange));
            current = switch (timeRange.toLowerCase()) {
                case "day" -> current.plusHours(1);
                case "week" -> current.plusDays(1);
                case "year" -> current.plusMonths(1);
                default -> current.plusDays(1); // month
            };
        }

        return result;
    }

    private String formatDate(LocalDateTime date, String timeRange) {
        return switch (timeRange.toLowerCase()) {
            case "day" -> date.format(DateTimeFormatter.ofPattern("HH:mm"));
            case "week" -> date.format(DateTimeFormatter.ofPattern("dd/MM"));
            case "year" -> date.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            default -> date.format(DateTimeFormatter.ofPattern("dd/MM")); // month
        };
    }

    @Override
    public List<String> getOnlineUsers() {
        return onlineUserEventService.requestOnlineUsers();
    }
} 