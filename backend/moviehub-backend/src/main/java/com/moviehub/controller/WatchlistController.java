package com.moviehub.controller;

import com.moviehub.entity.Movie;
import com.moviehub.entity.User;
import com.moviehub.entity.Watchlist;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.MovieRepository;
import com.moviehub.repository.UserRepository;
import com.moviehub.service.WatchlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public WatchlistController(
            WatchlistService watchlistService,
            UserRepository userRepository,
            MovieRepository movieRepository) {

        this.watchlistService = watchlistService;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addToWatchlist(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Movie not found"));

        Watchlist watchlist =
                watchlistService.addToWatchlist(user, movie);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(watchlist.getId());
    }

    @GetMapping
    public ResponseEntity<List<Watchlist>> getMyWatchlist(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(
                watchlistService.getUserWatchlist(user.getId())
        );
    }

    @GetMapping("/{movieId}/check")
    public ResponseEntity<Boolean> checkWatchlist(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        boolean exists = watchlistService
                .getUserMovieWatchlist(
                        user.getId(),
                        movieId
                )
                .isPresent();

        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> removeFromWatchlist(
            @PathVariable Long movieId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        watchlistService.removeFromWatchlist(
                user.getId(),
                movieId
        );

        return ResponseEntity.noContent().build();
    }
}