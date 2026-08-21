package com.moviehub.service;

import com.moviehub.entity.Movie;
import com.moviehub.entity.User;
import com.moviehub.entity.Watchlist;
import com.moviehub.exception.ConflictException;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public WatchlistService(WatchlistRepository watchlistRepository) {
        this.watchlistRepository = watchlistRepository;
    }

    public Watchlist addToWatchlist(User user, Movie movie) {

        if (watchlistRepository.existsByUserIdAndMovieId(
                user.getId(),
                movie.getId())) {

            throw new ConflictException(
                    "Movie is already in your watchlist"
            );
        }

        Watchlist watchlist = new Watchlist(user, movie);

        return watchlistRepository.save(watchlist);
    }

    public List<Watchlist> getUserWatchlist(Long userId) {

        return watchlistRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Watchlist> getUserMovieWatchlist(
            Long userId,
            Long movieId) {

        return watchlistRepository
                .findByUserIdAndMovieId(userId, movieId);
    }

    public void removeFromWatchlist(
            Long userId,
            Long movieId) {

        Watchlist watchlist = watchlistRepository
                .findByUserIdAndMovieId(userId, movieId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Movie is not in your watchlist"
                        ));

        watchlistRepository.delete(watchlist);
    }
}