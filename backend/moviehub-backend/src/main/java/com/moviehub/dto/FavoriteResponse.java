package com.moviehub.dto;

import com.moviehub.entity.Movie;

import java.time.LocalDateTime;

public class FavoriteResponse {

    private Long id;
    private Movie movie;
    private LocalDateTime createdAt;

    public FavoriteResponse(
            Long id,
            Movie movie,
            LocalDateTime createdAt) {

        this.id = id;
        this.movie = movie;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Movie getMovie() {
        return movie;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}