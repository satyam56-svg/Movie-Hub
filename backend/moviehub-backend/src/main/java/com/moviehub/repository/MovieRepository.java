package com.moviehub.repository;

import com.moviehub.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByTitleContainingIgnoreCase(
            String title,
            Pageable pageable
    );

    Page<Movie> findByGenreContainingIgnoreCase(
            String genre,
            Pageable pageable
    );

    Page<Movie> findByTitleContainingIgnoreCaseAndGenreContainingIgnoreCase(
            String title,
            String genre,
            Pageable pageable
    );

    Optional<Movie> findByTitleIgnoreCase(String title);
}