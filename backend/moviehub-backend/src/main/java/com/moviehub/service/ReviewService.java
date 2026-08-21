package com.moviehub.service;

import com.moviehub.dto.ReviewResponse;
import com.moviehub.entity.Review;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review saveReview(Review review) {
        return reviewRepository.save(review);
    }

    public List<ReviewResponse> getReviewsByMovie(Long movieId) {

        return reviewRepository.findByMovieId(movieId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<ReviewResponse> getMyReviews(Long userId) {

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<ReviewResponse> getReviewsByUser(Long userId) {

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private ReviewResponse convertToResponse(Review review) {

        return new ReviewResponse(
                review.getId(),
                review.getUser().getUsername(),
                review.getMovie().getId(),
                review.getMovie().getTitle(),
                review.getRating(),
                review.getReviewText(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public Optional<Review> getUserMovieReview(Long userId, Long movieId) {
        return reviewRepository.findByUserIdAndMovieId(userId, movieId);
    }

    public boolean reviewExists(Long userId, Long movieId) {
        return reviewRepository.existsByUserIdAndMovieId(userId, movieId);
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public Double getAverageRating(Long movieId) {
        Double average = reviewRepository.findAverageRatingByMovieId(movieId);

        if (average == null) {
            return 0.0;
        }

        return Math.round(average * 100.0) / 100.0;
    }

    public Optional<Review> getUserReviewById(Long reviewId, Long userId) {
        return reviewRepository.findByIdAndUserId(reviewId, userId);
    }

    public void deleteUserReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new RuntimeException("Review not found or access denied"));

        reviewRepository.delete(review);
    }

    public Review updateUserReview(
            Long reviewId,
            Long userId,
            Integer rating,
            String reviewText) {

        Review review = reviewRepository
                .findByIdAndUserId(reviewId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found or access denied"
                        ));

        review.setRating(rating);
        review.setReviewText(reviewText);

        return reviewRepository.save(review);
    }
}