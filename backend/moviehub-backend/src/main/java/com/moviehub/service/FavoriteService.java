package com.moviehub.service;

import com.moviehub.entity.Favorite;
import com.moviehub.entity.Movie;
import com.moviehub.entity.User;
import com.moviehub.exception.ConflictException;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.repository.FavoriteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public Favorite addToFavorites(User user, Movie movie) {

        if (favoriteRepository.existsByUserIdAndMovieId(
                user.getId(),
                movie.getId())) {

            throw new ConflictException(
                    "Movie is already in your favorites"
            );
        }

        Favorite favorite = new Favorite(user, movie);

        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getUserFavorites(Long userId) {

        return favoriteRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Favorite> getUserMovieFavorite(
            Long userId,
            Long movieId) {

        return favoriteRepository
                .findByUserIdAndMovieId(userId, movieId);
    }

    public void removeFromFavorites(
            Long userId,
            Long movieId) {

        Favorite favorite = favoriteRepository
                .findByUserIdAndMovieId(userId, movieId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Movie is not in your favorites"
                        ));

        favoriteRepository.delete(favorite);
    }
}