package com.moviehub.controller;

import com.moviehub.dto.MovieResponse;
import com.moviehub.entity.Movie;
import com.moviehub.service.MovieService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {

        Movie savedMovie = movieService.saveMovie(movie);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMovie);
    }

    @GetMapping
    public ResponseEntity<Page<MovieResponse>> getMovies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                movieService.getMovies(
                        search,
                        genre,
                        page,
                        size
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(
            @PathVariable Long id) {

        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(
            @PathVariable Long id) {

        if (movieService.getMovieById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        movieService.deleteMovie(id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(
            @PathVariable Long id,
            @RequestBody Movie movie) {

        if (movieService.getMovieById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Movie updatedMovie =
                movieService.updateMovie(id, movie);

        return ResponseEntity.ok(updatedMovie);
    }
}