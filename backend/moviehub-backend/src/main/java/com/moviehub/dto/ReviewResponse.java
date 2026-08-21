package com.moviehub.dto;

import java.time.LocalDateTime;

public class ReviewResponse {

    private Long id;
    private String username;
    private Long movieId;
    private String movieTitle;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewResponse(
            Long id,
            String username,
            Long movieId,
            String movieTitle,
            Integer rating,
            String reviewText,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.username = username;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.rating = rating;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Long getMovieId() {
        return movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public Integer getRating() {
        return rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}