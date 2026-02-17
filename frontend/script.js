class MovieDataManager {
    constructor() {
        this.scrapedData = null;
    }

    async loadScrapedData() {
        try {
            const response = await fetch('../data/movie_data.json');
            const data = await response.json();
            this.scrapedData = data;
            return data;
        } catch (error) {
            console.log('No scraped data found, using sample data');
            return null;
        }
    }

    async searchMovies(query) {
        try {
            const scraped = await this.loadScrapedData();

            if (scraped && scraped.length > 0) {
                return scraped.filter(movie =>
                    movie.title.toLowerCase().includes(query.toLowerCase()) ||
                    (movie.genre && movie.genre.toLowerCase().includes(query.toLowerCase()))
                );
            }

            return this.getSampleMovies().filter(movie =>
                movie.title.toLowerCase().includes(query.toLowerCase()) ||
                movie.genre.toLowerCase().includes(query.toLowerCase())
            );

        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    async getTopMovies() {
        const scraped = await this.loadScrapedData();
        if (scraped && scraped.length > 0) {
            return scraped.slice(0, 12);
        }

        return this.getSampleMovies();
    }

    getSampleMovies() {
        return [
            {
                title: "The Shawshank Redemption",
                year: "1994",
                imdbRating: "9.3",
                poster: "https://picsum.photos/seed/shawshank/300/450.jpg",
                genre: "Drama",
                source: "IMDb"
            },
            {
                title: "The Godfather",
                year: "1972",
                imdbRating: "9.2",
                poster: "https://picsum.photos/seed/godfather/300/450.jpg",
                genre: "Crime, Drama",
                source: "IMDb"
            },
            {
                title: "The Dark Knight",
                year: "2008",
                imdbRating: "9.0",
                poster: "https://picsum.photos/seed/darkknight/300/450.jpg",
                genre: "Action, Crime",
                source: "IMDb"
            },
            {
                title: "Pulp Fiction",
                year: "1994",
                imdbRating: "8.9",
                poster: "https://picsum.photos/seed/pulpfiction/300/450.jpg",
                genre: "Crime, Drama",
                source: "IMDb"
            },
            {
                title: "Forrest Gump",
                year: "1994",
                imdbRating: "8.8",
                poster: "https://picsum.photos/seed/forrestgump/300/450.jpg",
                genre: "Drama, Romance",
                source: "IMDb"
            },
            {
                title: "Inception",
                year: "2010",
                imdbRating: "8.8",
                poster: "https://picsum.photos/seed/inception/300/450.jpg",
                genre: "Action, Sci-Fi",
                source: "IMDb"
            },
            {
                title: "The Matrix",
                year: "1999",
                imdbRating: "8.7",
                poster: "https://picsum.photos/seed/matrix/300/450.jpg",
                genre: "Sci-Fi, Action",
                source: "IMDb"
            },
            {
                title: "Goodfellas",
                year: "1990",
                imdbRating: "8.7",
                poster: "https://picsum.photos/seed/goodfellas/300/450.jpg",
                genre: "Crime, Drama",
                source: "IMDb"
            },
            {
                title: "Interstellar",
                year: "2014",
                imdbRating: "8.6",
                poster: "https://picsum.photos/seed/interstellar/300/450.jpg",
                genre: "Sci-Fi, Drama",
                source: "IMDb"
            },
            {
                title: "Fight Club",
                year: "1999",
                imdbRating: "8.8",
                poster: "https://picsum.photos/seed/fightclub/300/450.jpg",
                genre: "Drama, Thriller",
                source: "IMDb"
            },
            {
                title: "The Lord of the Rings: The Return of the King",
                year: "2003",
                imdbRating: "8.9",
                poster: "https://picsum.photos/seed/lotr/300/450.jpg",
                genre: "Adventure, Fantasy",
                source: "IMDb"
            },
            {
                title: "Star Wars: Episode V - The Empire Strikes Back",
                year: "1980",
                imdbRating: "8.7",
                poster: "https://picsum.photos/seed/empire/300/450.jpg",
                genre: "Sci-Fi, Adventure",
                source: "IMDb"
            }
        ];
    }

    getTopActors() {
        return [
            {
                name: "Tom Hanks",
                movies: "Forrest Gump, The Shawshank Redemption, Cast Away",
                photo: "https://picsum.photos/seed/tomhanks2024/120/120.jpg"
            },
            {
                name: "Leonardo DiCaprio",
                movies: "Inception, The Dark Knight, Titanic",
                photo: "https://picsum.photos/seed/leonardo2024/120/120.jpg"
            },
            {
                name: "Morgan Freeman",
                movies: "The Shawshank Redemption, Seven, Driving Miss Daisy",
                photo: "https://picsum.photos/seed/morganfreeman2024/120/120.jpg"
            },
            {
                name: "Al Pacino",
                movies: "The Godfather, Scarface, Scent of a Woman",
                photo: "https://picsum.photos/seed/alpacino2024/120/120.jpg"
            },
            {
                name: "Robert De Niro",
                movies: "Taxi Driver, Goodfellas, Raging Bull",
                photo: "https://picsum.photos/seed/robertdeniro2024/120/120.jpg"
            },
            {
                name: "Brad Pitt",
                movies: "Fight Club, Once Upon a Time in Hollywood, Se7en",
                photo: "https://picsum.photos/seed/bradpitt2024/120/120.jpg"
            },
            {
                name: "Will Smith",
                movies: "The Pursuit of Happyness, Men in Black, Independence Day",
                photo: "https://picsum.photos/seed/willsmith2024/120/120.jpg"
            },
            {
                name: "Denzel Washington",
                movies: "Training Day, Glory, Malcolm X",
                photo: "https://picsum.photos/seed/denzel2024/120/120.jpg"
            },
            {
                name: "Scarlett Johansson",
                movies: "Lost in Translation, Black Widow, Marriage Story",
                photo: "https://picsum.photos/seed/scarlett2024/120/120.jpg"
            },
            {
                name: "Meryl Streep",
                movies: "The Devil Wears Prada, Sophie's Choice, Kramer vs. Kramer",
                photo: "https://picsum.photos/seed/meryl2024/120/120.jpg"
            },
            {
                name: "Anthony Hopkins",
                movies: "The Silence of the Lambs, Hannibal, Thor",
                photo: "https://picsum.photos/seed/hopkins2024/120/120.jpg"
            },
            {
                name: "Julia Roberts",
                movies: "Pretty Woman, Erin Brockovich, Notting Hill",
                photo: "https://picsum.photos/seed/juliaroberts2024/120/120.jpg"
            }
        ];
    }

    getMoviesByGenre(genre) {
        const genreMovies = {
            action: [
                { title: "The Dark Knight", year: "2008", rating: "9.0", poster: "https://picsum.photos/seed/darkknight2/300/450.jpg" },
                { title: "Mad Max: Fury Road", year: "2015", rating: "8.1", poster: "https://picsum.photos/seed/madmax/300/450.jpg" },
                { title: "Die Hard", year: "1988", rating: "8.2", poster: "https://picsum.photos/seed/diehard/300/450.jpg" }
            ],
            comedy: [
                { title: "The Grand Budapest Hotel", year: "2014", rating: "8.1", poster: "https://picsum.photos/seed/budapest/300/450.jpg" },
                { title: "Superbad", year: "2007", rating: "7.6", poster: "https://picsum.photos/seed/superbad/300/450.jpg" },
                { title: "Anchorman", year: "2004", rating: "7.2", poster: "https://picsum.photos/seed/anchorman/300/450.jpg" }
            ],
            drama: [
                { title: "The Shawshank Redemption", year: "1994", rating: "9.3", poster: "https://picsum.photos/seed/shawshank2/300/450.jpg" },
                { title: "Forrest Gump", year: "1994", rating: "8.8", poster: "https://picsum.photos/seed/forrestgump2/300/450.jpg" },
                { title: "The Godfather", year: "1972", rating: "9.2", poster: "https://picsum.photos/seed/godfather2/300/450.jpg" }
            ],
            horror: [
                { title: "The Shining", year: "1980", rating: "8.4", poster: "https://picsum.photos/seed/shining/300/450.jpg" },
                { title: "Get Out", year: "2017", rating: "7.7", poster: "https://picsum.photos/seed/getout/300/450.jpg" },
                { title: "A Quiet Place", year: "2018", rating: "7.5", poster: "https://picsum.photos/seed/quietplace/300/450.jpg" }
            ],
            romance: [
                { title: "The Notebook", year: "2004", rating: "7.8", poster: "https://picsum.photos/seed/notebook/300/450.jpg" },
                { title: "La La Land", year: "2016", rating: "8.0", poster: "https://picsum.photos/seed/lalaland/300/450.jpg" },
                { title: "Before Sunrise", year: "1995", rating: "8.1", poster: "https://picsum.photos/seed/beforesunrise/300/450.jpg" }
            ],
            scifi: [
                { title: "Inception", year: "2010", rating: "8.8", poster: "https://picsum.photos/seed/inception2/300/450.jpg" },
                { title: "Interstellar", year: "2014", rating: "8.6", poster: "https://picsum.photos/seed/interstellar/300/450.jpg" },
                { title: "The Matrix", year: "1999", rating: "8.7", poster: "https://picsum.photos/seed/matrix/300/450.jpg" }
            ]
        };

        return genreMovies[genre] || [];
    }
}

class UIManager {
    constructor() {
        this.dataManager = new MovieDataManager();
        this.init();
    }

    init() {
        this.loadTopMovies();
        this.loadTopActors();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });

                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        const searchInput = document.getElementById('movieSearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchMovies();
                }
            });
        }
    }

    async loadTopMovies() {
        const loadingElement = document.getElementById('moviesLoading');
        const gridElement = document.getElementById('moviesGrid');

        try {
            loadingElement.style.display = 'block';
            gridElement.innerHTML = '';

            console.log('Loading movies from scraped data...');

            const movies = await this.dataManager.getTopMovies();

            if (movies.length > 0) {
                this.displayMovies(movies, gridElement);
                loadingElement.style.display = 'none';
                console.log('Successfully loaded', movies.length, 'movies from scraped data');
            } else {
                throw new Error('No movies found');
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using sample data (no scraped data found)';

            const sampleMovies = this.dataManager.getSampleMovies();
            this.displayMovies(sampleMovies, gridElement);

            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 2000);
        }
    }

    async loadTopActors() {
        const loadingElement = document.getElementById('actorsLoading');
        const gridElement = document.getElementById('actorsGrid');

        try {
            if (!this.dataManager.scrapedData) {
                await this.dataManager.loadScrapedData();
            }

            let actors = [];
            if (this.dataManager.scrapedData && this.dataManager.scrapedData.length > 0) {
                const actorMap = new Map();
                this.dataManager.scrapedData.forEach(movie => {
                    if (Array.isArray(movie.actors)) {
                        movie.actors.forEach(actor => {
                            const name = typeof actor === 'object' ? actor.name : actor;
                            const photo = (typeof actor === 'object' && actor.photo) ? actor.photo : `https://via.placeholder.com/120x120/1a1a2e/fff?text=${encodeURIComponent(name.charAt(0))}`;

                            if (!actorMap.has(name)) {
                                actorMap.set(name, {
                                    name: name,
                                    movies: [movie.title],
                                    photo: photo
                                });
                            } else {
                                const actorData = actorMap.get(name);
                                if (!actorData.movies.includes(movie.title)) {
                                    actorData.movies.push(movie.title);
                                }
                                if (actorData.photo.includes('placeholder.com') && !photo.includes('placeholder.com')) {
                                    actorData.photo = photo;
                                }
                            }
                        });
                    }
                });

                actors = Array.from(actorMap.values()).map(a => ({
                    ...a,
                    movies: a.movies.slice(0, 3).join(', ')
                })).slice(0, 12);
            }

            if (actors.length === 0) {
                actors = this.dataManager.getTopActors();
            }

            this.displayActors(actors, gridElement);
            loadingElement.style.display = 'none';
        } catch (error) {
            console.error('Error loading actors:', error);
            loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error loading actors';
        }
    }

    displayMovies(movies, container) {
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="uiManager.showMovieDetails('${movie.title}')">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/fff?text=${encodeURIComponent(movie.title)}'">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.year}</div>
                    <div class="movie-rating">
                        <span class="rating-stars">★</span>
                        <span class="rating-value">${movie.imdbRating || movie.rating || 'N/A'}</span>
                    </div>
                    <div class="movie-source">Source: ${movie.source || 'MovieHub'}</div>
                </div>
            </div>
        `).join('');
    }

    displayActors(actors, container) {
        container.innerHTML = actors.map(actor => `
            <div class="actor-card" onclick="uiManager.showActorDetails('${actor.name}')">
                <img src="${actor.photo}" alt="${actor.name}" class="actor-photo"
                     onerror="this.src='https://via.placeholder.com/120x120/1a1a2e/fff?text=${encodeURIComponent(actor.name)}'">
                <div class="actor-name">${actor.name}</div>
                <div class="actor-movies">${actor.movies}</div>
            </div>
        `).join('');
    }

    async searchMovies() {
        const query = document.getElementById('movieSearch').value.trim();
        if (!query) return;

        const searchResultsGrid = document.getElementById('searchResultsGrid');
        const searchResultsSection = document.getElementById('search-results');

        searchResultsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching scraped data...</div>';
        searchResultsSection.style.display = 'block';

        try {
            console.log('Searching scraped data for:', query);

            // Search in scraped data
            const searchResults = await this.dataManager.searchMovies(query);

            if (searchResults && searchResults.length > 0) {
                console.log('Found', searchResults.length, 'results in scraped data');
                this.displayMovies(searchResults, searchResultsGrid);
            } else {
                searchResultsGrid.innerHTML = '<div class="loading">No movies found in scraped data. Try another search!</div>';
            }

            searchResultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error searching movies:', error);
            searchResultsGrid.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i> Error searching scraped data</div>';
        }
    }

    async loadGenreMovies(genre) {
        const searchResultsGrid = document.getElementById('searchResultsGrid');
        const searchResultsSection = document.getElementById('search-results');

        searchResultsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading genre movies...</div>';
        searchResultsSection.style.display = 'block';

        try {
            await this.delay(800);

            const movies = this.dataManager.getMoviesByGenre(genre);
            this.displayMovies(movies, searchResultsGrid);

            searchResultsSection.querySelector('.section-title').textContent = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`;

            searchResultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading genre movies:', error);
            searchResultsGrid.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i> Error loading movies</div>';
        }
    }

    showMovieDetails(title) {
        const modal = document.getElementById('movieModal');
        const detailsContainer = document.getElementById('movieDetails');

        if (!this.dataManager.scrapedData) {
            this.loadTopMovies().then(() => this.showMovieDetails(title));
            return;
        }

        const movie = this.dataManager.scrapedData.find(m => m.title === title) ||
            this.dataManager.getSampleMovies().find(m => m.title === title);

        if (movie) {
            const genres = movie.genre || 'N/A';
            const plot = movie.plot || 'Detailed movie information is being fetched. This movie is one of the top-rated films on our platform.';

            let actorsText = 'N/A';
            if (Array.isArray(movie.actors)) {
                actorsText = movie.actors.map(a => typeof a === 'object' ? a.name : a).join(', ');
            } else if (movie.actors) {
                actorsText = movie.actors;
            }

            const director = movie.director || 'N/A';

            detailsContainer.innerHTML = `
                <div class="movie-detail-header">
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-detail-poster"
                         onerror="this.src='https://via.placeholder.com/200x300/1a1a2e/fff?text=${encodeURIComponent(movie.title)}'">
                    <div class="movie-detail-info">
                        <h2>${movie.title}</h2>
                        <div class="movie-detail-meta">
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${movie.year !== 'Unknown' ? movie.year : 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-star"></i>
                                <span>${movie.imdbRating || movie.rating || 'N/A'}/10</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-film"></i>
                                <span>${genres}</span>
                            </div>
                        </div>
                        <div class="movie-detail-description">
                            <p><strong>Director:</strong> ${director}</p>
                            <p><strong>Cast:</strong> ${actorsText}</p>
                            <p style="margin-top: 1rem;">${plot}</p>
                        </div>
                    </div>
                </div>
                <div class="ratings-comparison">
                    <h3>Ratings Comparison</h3>
                    <div class="rating-source">
                        <span><i class="fab fa-imdb"></i> IMDb</span>
                        <span>${movie.imdbRating || 'N/A'}/10</span>
                    </div>
                    <div class="rating-source">
                        <span><i class="fas fa-apple-alt"></i> Rotten Tomatoes</span>
                        <span>${movie.rotten_tomatoes_score || 'N/A'}</span>
                    </div>
                    <div class="rating-source">
                        <span><i class="fas fa-chart-line"></i> Metacritic</span>
                        <span>${movie.metacritic_score || 'N/A'}/100</span>
                    </div>
                </div>
            `;
        }

        modal.style.display = 'block';
    }

    showActorDetails(name) {
        const modal = document.getElementById('movieModal');
        const detailsContainer = document.getElementById('movieDetails');

        const actors = this.dataManager.getTopActors();
        const actor = actors.find(a => a.name === name);

        if (actor) {
            detailsContainer.innerHTML = `
                <div style="text-align: center;">
                    <img src="${actor.photo}" alt="${actor.name}" style="width: 200px; height: 200px; border-radius: 50%; margin-bottom: 2rem;"
                         onerror="this.src='https://via.placeholder.com/200x200/1a1a2e/fff?text=${encodeURIComponent(actor.name)}'">
                    <h2 style="color: #f5c518; margin-bottom: 1rem;">${actor.name}</h2>
                    <div class="movie-detail-description">
                        <p><strong>Notable Movies:</strong> ${actor.movies}</p>
                        <p style="margin-top: 1rem;">This is a demonstration of actor details. In a real implementation, this would show the actor's biography, filmography, awards, and detailed information from multiple sources.</p>
                        <p>The actor data would be collected through web scraping from IMDb and other movie databases to provide comprehensive information about their career and achievements.</p>
                    </div>
                </div>
            `;
        }

        modal.style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

function searchMovies() {
    uiManager.searchMovies();
}

function loadGenreMovies(genre) {
    uiManager.loadGenreMovies(genre);
}

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
});

window.onclick = function (event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
