package com.moviehub.service;

import com.moviehub.dto.AdminUserResponse;
import com.moviehub.dto.ReviewResponse;
import com.moviehub.entity.Review;
import com.moviehub.entity.User;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.MovieRepository;
import com.moviehub.repository.ReviewRepository;
import com.moviehub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;

    public AdminService(
            UserRepository userRepository,
            MovieRepository movieRepository,
            ReviewRepository reviewRepository) {

        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
    }

    // ================= DASHBOARD =================

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalMovies() {
        return movieRepository.count();
    }

    public long getTotalReviews() {
        return reviewRepository.count();
    }

    // ================= USER MANAGEMENT =================

    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .toList();
    }

    public void deleteUser(Long id, String adminEmail) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new IllegalArgumentException(
                    "Admin cannot delete their own account"
            );
        }

        userRepository.delete(user);
    }

    public User updateUserRole(Long id, String role) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        User.Role newRole;

        try {
            newRole = User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid role. Allowed roles: USER, ADMIN"
            );
        }

        user.setRole(newRole);

        return userRepository.save(user);
    }

    // ================= REVIEW MANAGEMENT =================

    public List<ReviewResponse> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(review -> new ReviewResponse(
                        review.getId(),
                        review.getUser().getUsername(),
                        review.getMovie().getId(),
                        review.getMovie().getTitle(),
                        review.getRating(),
                        review.getReviewText(),
                        review.getCreatedAt(),
                        review.getUpdatedAt()
                ))
                .toList();
    }

    public void deleteReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found"
                        ));

        reviewRepository.delete(review);
    }
}