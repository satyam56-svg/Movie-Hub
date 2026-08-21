package com.moviehub.dto;

public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private String genre;

    // Existing / legacy fields
    private Double rating;
    private Integer releaseYear;
    private String posterUrl;

    // External ratings
    private Double imdbRating;

    private Integer tomatometer;
    private Integer popcornmeter;

    private Double metacriticScore;
    private Double metacriticUserScore;

    // Movie metadata
    private String releaseDate;
    private String runtime;

    private String director;
    private String cast;

    // External source URLs
    private String rtUrl;
    private String metacriticUrl;

    // MovieHub user rating
    private Double userRating;

    public MovieResponse(
            Long id,
            String title,
            String description,
            String genre,
            Double rating,
            Integer releaseYear,
            String posterUrl,
            Double imdbRating,
            Integer tomatometer,
            Integer popcornmeter,
            Double metacriticScore,
            Double metacriticUserScore,
            String releaseDate,
            String runtime,
            String director,
            String cast,
            String rtUrl,
            String metacriticUrl,
            Double userRating) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.rating = rating;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;

        this.imdbRating = imdbRating;
        this.tomatometer = tomatometer;
        this.popcornmeter = popcornmeter;
        this.metacriticScore = metacriticScore;
        this.metacriticUserScore = metacriticUserScore;

        this.releaseDate = releaseDate;
        this.runtime = runtime;

        this.director = director;
        this.cast = cast;

        this.rtUrl = rtUrl;
        this.metacriticUrl = metacriticUrl;

        this.userRating = userRating;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getGenre() {
        return genre;
    }

    public Double getRating() {
        return rating;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public Double getImdbRating() {
        return imdbRating;
    }

    public Integer getTomatometer() {
        return tomatometer;
    }

    public Integer getPopcornmeter() {
        return popcornmeter;
    }

    public Double getMetacriticScore() {
        return metacriticScore;
    }

    public Double getMetacriticUserScore() {
        return metacriticUserScore;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public String getRuntime() {
        return runtime;
    }

    public String getDirector() {
        return director;
    }

    public String getCast() {
        return cast;
    }

    public String getRtUrl() {
        return rtUrl;
    }

    public String getMetacriticUrl() {
        return metacriticUrl;
    }

    public Double getUserRating() {
        return userRating;
    }
}