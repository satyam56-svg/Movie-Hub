package com.moviehub.dto;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String role
) {
}