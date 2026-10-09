package com.moviehub.service;

import com.moviehub.dto.MovieResponse;
import com.moviehub.entity.Movie;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.MovieRepository;
import com.moviehub.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;

    public MovieService(
            MovieRepository movieRepository,
            ReviewRepository reviewRepository) {

        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Page<MovieResponse> getMovies(
            String search,
            String genre,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Movie> movies;

        if (search != null && !search.isBlank()
                && genre != null && !genre.isBlank()) {

            movies = movieRepository
                    .findByTitleContainingIgnoreCaseAndGenreContainingIgnoreCase(
                            search,
                            genre,
                            pageable
                    );

        } else if (search != null && !search.isBlank()) {

            movies = movieRepository
                    .findByTitleContainingIgnoreCase(
                            search,
                            pageable
                    );

        } else if (genre != null && !genre.isBlank()) {

            movies = movieRepository
                    .findByGenreContainingIgnoreCase(
                            genre,
                            pageable
                    );

        } else {

            movies = movieRepository.findAll(pageable);
        }

        return movies.map(this::convertToResponse);
    }

    public Optional<MovieResponse> getMovieById(Long id) {

        return movieRepository.findById(id)
                .map(this::convertToResponse);
    }

    private MovieResponse convertToResponse(Movie movie) {

        Double userRating =
                reviewRepository.findAverageRatingByMovieId(movie.getId());

        if (userRating == null) {
            userRating = 0.0;
        } else {
            userRating = Math.round(userRating * 100.0) / 100.0;
        }

        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getGenre(),

                // Legacy fields
                movie.getRating(),
                movie.getReleaseYear(),
                movie.getPosterUrl(),

                // External ratings
                movie.getImdbRating(),
                movie.getTomatometer(),
                movie.getPopcornmeter(),
                movie.getMetacriticScore(),
                movie.getMetacriticUserScore(),

                // Movie metadata
                movie.getReleaseDate(),
                movie.getRuntime(),
                movie.getDirector(),
                movie.getCast(),

                // Source URLs
                movie.getRtUrl(),
                movie.getMetacriticUrl(),

                // MovieHub user rating
                userRating
        );
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    public Movie updateMovie(Long id, Movie updatedMovie) {

        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Movie not found"));

        // Basic movie information
        existingMovie.setTitle(updatedMovie.getTitle());
        existingMovie.setDescription(updatedMovie.getDescription());
        existingMovie.setGenre(updatedMovie.getGenre());

        // Legacy fields
        existingMovie.setRating(updatedMovie.getRating());
        existingMovie.setReleaseYear(updatedMovie.getReleaseYear());
        existingMovie.setPosterUrl(updatedMovie.getPosterUrl());

        // External ratings
        existingMovie.setImdbRating(updatedMovie.getImdbRating());
        existingMovie.setTomatometer(updatedMovie.getTomatometer());
        existingMovie.setPopcornmeter(updatedMovie.getPopcornmeter());
        existingMovie.setMetacriticScore(
                updatedMovie.getMetacriticScore()
        );
        existingMovie.setMetacriticUserScore(
                updatedMovie.getMetacriticUserScore()
        );

        // Movie metadata
        existingMovie.setReleaseDate(
                updatedMovie.getReleaseDate()
        );
        existingMovie.setRuntime(
                updatedMovie.getRuntime()
        );
        existingMovie.setDirector(
                updatedMovie.getDirector()
        );
        existingMovie.setCast(
                updatedMovie.getCast()
        );

        // External source URLs
        existingMovie.setRtUrl(
                updatedMovie.getRtUrl()
        );
        existingMovie.setMetacriticUrl(
                updatedMovie.getMetacriticUrl()
        );

        return movieRepository.save(existingMovie);
    }
}