package com.moviehub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;

    @Size(max = 2000, message = "Review must not exceed 2000 characters")
    private String reviewText;

    public ReviewRequest() {
    }

    public Long getMovieId() {
        return movieId;
    }

    public Integer getRating() {
        return rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }
}