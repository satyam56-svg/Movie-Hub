package com.moviehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private String genre;

    /*
     * Existing field.
     * Keep temporarily for backward compatibility
     * with existing APIs/data.
     */
    @Column
    private Double rating;

    /*
     * Existing field.
     * Keep for backward compatibility.
     *
     * Scraped dataset uses releaseDate separately.
     */
    @Column
    private Integer releaseYear;

    /*
     * Existing field.
     * Keep because current frontend/API may still use it.
     */
    @Column
    private String posterUrl;

    // ==========================================================
    // EXTERNAL RATINGS
    // ==========================================================

    @Column
    private Double imdbRating;

    /*
     * Rotten Tomatoes critic score.
     * Example: 95
     */
    @Column
    private Integer tomatometer;

    /*
     * Rotten Tomatoes audience score.
     * Example: 91
     */
    @Column
    private Integer popcornmeter;

    /*
     * Metacritic critic score.
     * Example: 82
     */
    @Column
    private Double metacriticScore;

    /*
     * Metacritic user score.
     * Example: 7.1
     */
    @Column
    private Double metacriticUserScore;

    // ==========================================================
    // MOVIE METADATA
    // ==========================================================

    /*
     * Keep the original scraped release information.
     *
     * Examples:
     * "In Theaters Aug 21"
     * "Now Playing"
     * "Jul 2026"
     * "2026"
     */
    @Column
    private String releaseDate;

    /*
     * Examples:
     * "1h 46m"
     * "2h 10m"
     */
    @Column
    private String runtime;

    @Column
    private String director;

    @Column(name = "cast_members", length = 2000)
    private String cast;

    // ==========================================================
    // SOURCE URLS
    // ==========================================================

    @Column(length = 1000)
    private String rtUrl;

    @Column(length = 1000)
    private String metacriticUrl;

    // ==========================================================
    // CONSTRUCTORS
    // ==========================================================

    public Movie() {
    }

    /*
     * Existing constructor.
     * Keep it so existing code does not immediately break.
     */
    public Movie(
            String title,
            String description,
            String genre,
            Double rating,
            Integer releaseYear,
            String posterUrl) {

        this.title = title;
        this.description = description;
        this.genre = genre;
        this.rating = rating;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;
    }

    // ==========================================================
    // GETTERS
    // ==========================================================

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

    // ==========================================================
    // SETTERS
    // ==========================================================

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public void setImdbRating(Double imdbRating) {
        this.imdbRating = imdbRating;
    }

    public void setTomatometer(Integer tomatometer) {
        this.tomatometer = tomatometer;
    }

    public void setPopcornmeter(Integer popcornmeter) {
        this.popcornmeter = popcornmeter;
    }

    public void setMetacriticScore(Double metacriticScore) {
        this.metacriticScore = metacriticScore;
    }

    public void setMetacriticUserScore(Double metacriticUserScore) {
        this.metacriticUserScore = metacriticUserScore;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public void setCast(String cast) {
        this.cast = cast;
    }

    public void setRtUrl(String rtUrl) {
        this.rtUrl = rtUrl;
    }

    public void setMetacriticUrl(String metacriticUrl) {
        this.metacriticUrl = metacriticUrl;
    }
}