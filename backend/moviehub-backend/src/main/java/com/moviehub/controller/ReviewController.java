package com.moviehub.controller;

import com.moviehub.dto.ReviewRequest;
import com.moviehub.dto.ReviewResponse;
import com.moviehub.entity.Movie;
import com.moviehub.entity.Review;
import com.moviehub.entity.User;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.MovieRepository;
import com.moviehub.repository.UserRepository;
import com.moviehub.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public ReviewController(
            ReviewService reviewService,
            UserRepository userRepository,
            MovieRepository movieRepository) {

        this.reviewService = reviewService;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (reviewService.reviewExists(user.getId(), movie.getId())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("You have already reviewed this movie");
        }

        Review review = new Review(
                user,
                movie,
                request.getRating(),
                request.getReviewText()
        );

        Review savedReview = reviewService.saveReview(review);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedReview.getId());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ReviewResponse>> getMovieReviews(
            @PathVariable Long movieId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByMovie(movieId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(
                reviewService.getReviewsByUser(user.getId())
        );
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        reviewService.deleteUserReview(
                reviewId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Review updatedReview = reviewService.updateUserReview(
                reviewId,
                user.getId(),
                request.getRating(),
                request.getReviewText()
        );

        return ResponseEntity.ok(updatedReview.getId());
    }
}