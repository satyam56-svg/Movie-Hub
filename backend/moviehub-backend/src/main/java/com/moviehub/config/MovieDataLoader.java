package com.moviehub.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviehub.entity.Movie;
import com.moviehub.repository.MovieRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.InputStream;
import java.util.List;

@Component
public class MovieDataLoader implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final ObjectMapper objectMapper;

    public MovieDataLoader(
            MovieRepository movieRepository,
            ObjectMapper objectMapper) {

        this.movieRepository = movieRepository;
        this.objectMapper = objectMapper;
    }

    // ==========================================================
    // APPLICATION STARTUP
    // ==========================================================

    @Override
    public void run(String... args) throws Exception {

        System.out.println(
                "Loading movies from movies_integrated.json..."
        );

        loadMoviesFromJson();
    }

    // ==========================================================
    // REUSABLE JSON IMPORT
    // ==========================================================

    public MovieImportResult loadMoviesFromJson() throws Exception {

        ClassPathResource resource =
                new ClassPathResource("movies_integrated.json");

        try (InputStream inputStream = resource.getInputStream()) {

            List<Movie> movies = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Movie>>() {}
            );

            int inserted = 0;
            int updated = 0;

            for (Movie movie : movies) {

                Movie existingMovie =
                        movieRepository
                                .findByTitleIgnoreCase(
                                        movie.getTitle()
                                )
                                .orElse(null);

                if (existingMovie != null) {

                    updateMovie(existingMovie, movie);

                    movieRepository.save(existingMovie);

                    updated++;

                    System.out.println(
                            "Updated movie: "
                                    + movie.getTitle()
                    );

                } else {

                    prepareNewMovie(movie);

                    movieRepository.save(movie);

                    inserted++;

                    System.out.println(
                            "Inserted movie: "
                                    + movie.getTitle()
                    );
                }
            }

            System.out.println(
                    "\nMovie import completed."
            );

            System.out.println(
                    "Inserted: " + inserted
            );

            System.out.println(
                    "Updated: " + updated
            );

            System.out.println(
                    "Total processed: " + movies.size()
            );

            return new MovieImportResult(
                    inserted,
                    updated,
                    movies.size()
            );
        }
    }

    public MovieImportResult loadMoviesFromScraperFile(
            Path jsonFile) throws Exception {

        try (InputStream inputStream =
                     Files.newInputStream(jsonFile)) {

            List<Movie> movies = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Movie>>() {}
            );

            int inserted = 0;
            int updated = 0;

            for (Movie movie : movies) {

                Movie existingMovie =
                        movieRepository
                                .findByTitleIgnoreCase(
                                        movie.getTitle()
                                )
                                .orElse(null);

                if (existingMovie != null) {

                    updateMovie(existingMovie, movie);
                    movieRepository.save(existingMovie);
                    updated++;

                    System.out.println(
                            "Updated movie: "
                                    + movie.getTitle()
                    );

                } else {

                    prepareNewMovie(movie);
                    movieRepository.save(movie);
                    inserted++;

                    System.out.println(
                            "Inserted movie: "
                                    + movie.getTitle()
                    );
                }
            }

            System.out.println(
                    "\nMovie import completed."
            );

            System.out.println(
                    "Inserted: " + inserted
            );

            System.out.println(
                    "Updated: " + updated
            );

            System.out.println(
                    "Total processed: " + movies.size()
            );

            return new MovieImportResult(
                    inserted,
                    updated,
                    movies.size()
            );
        }
    }

    // ==========================================================
    // PREPARE NEW MOVIE
    // ==========================================================

    private void prepareNewMovie(Movie movie) {

        if (movie.getRating() == null) {
            movie.setRating(
                    movie.getImdbRating() != null
                            ? movie.getImdbRating()
                            : 0.0
            );
        }

        if (movie.getReleaseYear() == null) {
            movie.setReleaseYear(0);
        }

        if (movie.getPosterUrl() == null) {
            movie.setPosterUrl("");
        }
    }

    // ==========================================================
    // UPDATE EXISTING MOVIE
    // ==========================================================

    private void updateMovie(
            Movie existing,
            Movie scraped) {

        existing.setTitle(scraped.getTitle());
        existing.setDescription(scraped.getDescription());
        existing.setGenre(scraped.getGenre());

        if (scraped.getRating() != null) {
            existing.setRating(scraped.getRating());
        }

        if (scraped.getReleaseYear() != null) {
            existing.setReleaseYear(scraped.getReleaseYear());
        }

        if (scraped.getPosterUrl() != null) {
            existing.setPosterUrl(scraped.getPosterUrl());
        }

        existing.setImdbRating(
                scraped.getImdbRating()
        );

        existing.setTomatometer(
                scraped.getTomatometer()
        );

        existing.setPopcornmeter(
                scraped.getPopcornmeter()
        );

        existing.setMetacriticScore(
                scraped.getMetacriticScore()
        );

        existing.setMetacriticUserScore(
                scraped.getMetacriticUserScore()
        );

        existing.setReleaseDate(
                scraped.getReleaseDate()
        );

        existing.setRuntime(
                scraped.getRuntime()
        );

        existing.setDirector(
                scraped.getDirector()
        );

        existing.setCast(
                scraped.getCast()
        );

        existing.setRtUrl(
                scraped.getRtUrl()
        );

        existing.setMetacriticUrl(
                scraped.getMetacriticUrl()
        );
    }

    // ==========================================================
    // IMPORT RESULT
    // ==========================================================

    public record MovieImportResult(
            int inserted,
            int updated,
            int totalProcessed
    ) {
    }
}