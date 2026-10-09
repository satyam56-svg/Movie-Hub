package com.moviehub.repository;

import com.moviehub.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    Page<Movie> findByDirectorContainingIgnoreCase(
            String director,
            Pageable pageable
    );

    @Query("SELECT m FROM Movie m WHERE " +
           "(LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.director) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Movie> findByTitleOrDirectorContainingIgnoreCase(
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT m FROM Movie m WHERE " +
           "(LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.director) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "LOWER(m.genre) LIKE LOWER(CONCAT('%', :genre, '%'))")
    Page<Movie> findByTitleOrDirectorContainingIgnoreCaseAndGenreContainingIgnoreCase(
            @Param("search") String search,
            @Param("genre") String genre,
            Pageable pageable
    );

    @Query("SELECT m FROM Movie m WHERE " +
           "LOWER(m.director) LIKE LOWER(CONCAT('%', :director, '%')) AND " +
           "LOWER(m.genre) LIKE LOWER(CONCAT('%', :genre, '%'))")
    Page<Movie> findByDirectorContainingIgnoreCaseAndGenreContainingIgnoreCase(
            @Param("director") String director,
            @Param("genre") String genre,
            Pageable pageable
    );

    Optional<Movie> findByTitleIgnoreCase(String title);
}