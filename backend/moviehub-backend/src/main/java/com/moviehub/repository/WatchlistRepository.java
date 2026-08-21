package com.moviehub.repository;

import com.moviehub.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    Optional<Watchlist> findByUserIdAndMovieId(
            Long userId,
            Long movieId
    );

    boolean existsByUserIdAndMovieId(
            Long userId,
            Long movieId
    );

    List<Watchlist> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );
}