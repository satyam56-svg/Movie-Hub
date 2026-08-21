package com.moviehub.controller;

import com.moviehub.entity.Favorite;
import com.moviehub.entity.Movie;
import com.moviehub.entity.User;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.MovieRepository;
import com.moviehub.repository.UserRepository;
import com.moviehub.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.moviehub.dto.FavoriteResponse;
import com.moviehub.entity.Favorite;
import com.moviehub.entity.Movie;
import com.moviehub.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public FavoriteController(
            FavoriteService favoriteService,
            UserRepository userRepository,
            MovieRepository movieRepository) {

        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addToFavorites(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Movie not found"));

        Favorite favorite =
                favoriteService.addToFavorites(user, movie);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(favorite.getId());
    }

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<FavoriteResponse> response =
                favoriteService.getUserFavorites(user.getId())
                        .stream()
                        .map(favorite ->
                                new FavoriteResponse(
                                        favorite.getId(),
                                        favorite.getMovie(),
                                        favorite.getCreatedAt()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{movieId}/check")
    public ResponseEntity<Boolean> checkFavorite(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        boolean exists = favoriteService
                .getUserMovieFavorite(
                        user.getId(),
                        movieId
                )
                .isPresent();

        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        favoriteService.removeFromFavorites(
                user.getId(),
                movieId
        );

        return ResponseEntity.noContent().build();
    }
}