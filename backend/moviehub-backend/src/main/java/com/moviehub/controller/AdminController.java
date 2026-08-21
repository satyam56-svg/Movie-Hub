package com.moviehub.controller;

import com.moviehub.dto.ReviewResponse;
import com.moviehub.service.AdminService;
import com.moviehub.service.ScrapingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ScrapingService scrapingService;

    public AdminController(
            AdminService adminService,
            ScrapingService scrapingService) {

        this.adminService = adminService;
        this.scrapingService = scrapingService;
    }

    // ================= DASHBOARD =================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {

        Map<String, Long> stats = Map.of(
                "totalUsers", adminService.getTotalUsers(),
                "totalMovies", adminService.getTotalMovies(),
                "totalReviews", adminService.getTotalReviews()
        );

        return ResponseEntity.ok(stats);
    }

    // ================= USER MANAGEMENT =================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        String adminEmail = authentication.getName();

        adminService.deleteUser(id, adminEmail);

        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {

        return ResponseEntity.ok(
                adminService.updateUserRole(id, role)
        );
    }

    // ================= REVIEW MANAGEMENT =================

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {

        return ResponseEntity.ok(
                adminService.getAllReviews()
        );
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId) {

        adminService.deleteReview(reviewId);

        return ResponseEntity.noContent().build();
    }

    // ================= SCRAPING =================

    @PostMapping("/scrape")
    public ResponseEntity<?> runScraper(
            @RequestParam(defaultValue = "5") int limit) {

        try {

            ScrapingService.ScrapingResult result =
                    scrapingService.runScraper(limit);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Scraping failed",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }
}