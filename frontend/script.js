// GPS Location Manager
class LocationManager {
    constructor() {
        this.currentLocation = null;
        this.watchId = null;
    }

    // Detect user's current location
    async detectLocation() {
        const locationElement = document.getElementById('currentLocation');
        const refreshBtn = document.getElementById('refreshLocation');
        
        if (!navigator.geolocation) {
            locationElement.textContent = 'Location not supported';
            this.loadDefaultTheaters();
            return null;
        }

        // Show loading state
        locationElement.textContent = 'Detecting...';
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        return new Promise((resolve, reject) => {
            // Add timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                locationElement.textContent = 'Location timeout';
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                this.loadDefaultTheaters();
                reject(new Error('Location detection timeout'));
            }, 15000); // 15 second timeout

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    clearTimeout(timeoutId);
                    const { latitude, longitude } = position.coords;
                    this.currentLocation = { latitude, longitude };
                    
                    console.log('Location detected successfully:', this.currentLocation);
                    
                    try {
                        // Get location name using reverse geocoding
                        const locationName = await this.getLocationName(latitude, longitude);
                        locationElement.textContent = locationName;
                        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        
                        // Load nearby theaters
                        await this.loadNearbyTheaters();
                        
                        // Update content based on location
                        this.updateContentForLocation(locationName);
                        
                        resolve(this.currentLocation);
                    } catch (error) {
                        console.error('Error processing location:', error);
                        locationElement.textContent = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        
                        // Still load theaters even if location name fails
                        await this.loadNearbyTheaters();
                        resolve(this.currentLocation);
                    }
                },
                (error) => {
                    clearTimeout(timeoutId);
                    console.error('Location error:', error);
                    
                    let errorMessage = 'Location denied';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location timeout';
                            break;
                        default:
                            errorMessage = 'Location error';
                            break;
                    }
                    
                    locationElement.textContent = errorMessage;
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    
                    // Load default content
                    this.loadDefaultTheaters();
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // Get location name from coordinates (using Nominatim API)
    async getLocationName(lat, lon) {
        try {
            console.log(`Getting location name for coordinates: ${lat}, ${lon}`);
            
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'MovieHub/1.0 (movie-portal@example.com)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Location name response:', data);
            
            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown';
                const state = data.address.state || data.address.region || '';
                const country = data.address.country || '';
                
                let locationName = city;
                if (state && state !== city) {
                    locationName += state ? `, ${state}` : '';
                }
                if (country && country !== 'India' && country !== 'United States') {
                    locationName += `, ${country}`;
                }
                
                return locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            }
            
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        } catch (error) {
            console.error('Error getting location name:', error);
            // Return coordinates as fallback
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
    }

    // Update content based on location
    updateContentForLocation(locationName) {
        console.log(`Updating content for location: ${locationName}`);
        
        // You can customize movie recommendations based on location
        // For example: show regional movies, local theaters, etc.
        
        // Update hero section with location-based message
        const heroContent = document.querySelector('.hero-content p');
        if (heroContent) {
            heroContent.textContent = `Get ratings, reviews, and recommendations from multiple sources • Located in ${locationName}`;
        }
    }

    // Load nearby theaters based on location
    async loadNearbyTheaters() {
        const theatersGrid = document.getElementById('theatersGrid');
        const loadingElement = document.getElementById('theatersLoading');
        
        if (!this.currentLocation) {
            console.log('No location available, loading default theaters');
            this.loadDefaultTheaters();
            return;
        }

        try {
            console.log('Loading nearby theaters for location:', this.currentLocation);
            
            // Try multiple approaches to find theaters
            let theaters = [];
            
            // Method 1: Try Overpass API
            theaters = await this.tryOverpassAPI();
            
            // Method 2: If Overpass fails, use enhanced defaults based on location
            if (theaters.length === 0) {
                console.log('Overpass API failed or returned no results, using location-based defaults');
                theaters = this.getLocationBasedTheaters();
            }
            
            loadingElement.style.display = 'none';
            
            if (theaters.length > 0) {
                this.displayTheaters(theaters);
            } else {
                console.log('No theaters found, loading default theaters');
                this.loadDefaultTheaters();
            }
            
        } catch (error) {
            console.error('Error loading nearby theaters:', error);
            console.log('Falling back to default theaters');
            loadingElement.style.display = 'none';
            this.loadDefaultTheaters();
        }
    }

    // Try Overpass API with better error handling
    async tryOverpassAPI() {
        try {
            const { latitude, longitude } = this.currentLocation;
            const radius = 15000; // 15km radius
            
            const query = `
                [out:json][timeout:10];
                (
                    node["amenity"="cinema"](around:${radius},${latitude},${longitude});
                    way["amenity"="cinema"](around:${radius},${latitude},${longitude});
                );
                out center;
            `;
            
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'MovieHub/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Overpass API response:', data);
            
            return data.elements || [];
            
        } catch (error) {
            console.error('Overpass API failed:', error);
            return [];
        }
    }

    // Get location-based default theaters
    getLocationBasedTheaters() {
        const { latitude, longitude } = this.currentLocation;
        
        // Different theater sets based on approximate location
        const theaterSets = {
            'india': [
                { name: 'PVR Cinemas', lat: latitude + 0.01, lon: longitude + 0.01, address: 'City Center Mall' },
                { name: 'INOX Movies', lat: latitude + 0.02, lon: longitude + 0.01, address: 'Shopping Complex' },
                { name: 'Cinepolis', lat: latitude + 0.01, lon: longitude + 0.02, address: 'Entertainment Zone' },
                { name: 'Carnival Cinemas', lat: latitude - 0.01, lon: longitude + 0.01, address: 'Multiplex Mall' }
            ],
            'default': [
                { name: 'AMC Theater', lat: latitude + 0.01, lon: longitude + 0.01, address: 'Downtown Mall' },
                { name: 'Regal Cinemas', lat: latitude + 0.02, lon: longitude + 0.01, address: 'City Center' },
                { name: 'Cinemark', lat: latitude + 0.01, lon: longitude + 0.02, address: 'Entertainment Complex' },
                { name: 'Marcus Theaters', lat: latitude - 0.01, lon: longitude + 0.01, address: 'Shopping Plaza' }
            ]
        };
        
        // Rough location detection based on coordinates
        let locationKey = 'default';
        if (latitude > 6 && latitude < 38 && longitude > 68 && longitude < 97) {
            locationKey = 'india'; // Roughly India coordinates
        }
        
        const theaters = theaterSets[locationKey] || theaterSets['default'];
        
        // Add calculated distances
        return theaters.map(theater => ({
            ...theater,
            tags: {
                name: theater.name,
                'addr:street': theater.address
            }
        }));
    }

    // Display theaters in the grid
    displayTheaters(theaters) {
        const theatersGrid = document.getElementById('theatersGrid');
        
        const theaterCards = theaters.map(theater => {
            const name = theater.tags?.name || 'Unknown Theater';
            
            // Get coordinates from different possible locations
            let lat, lon;
            if (theater.lat && theater.lon) {
                lat = theater.lat;
                lon = theater.lon;
            } else if (theater.center?.lat && theater.center?.lon) {
                lat = theater.center.lat;
                lon = theater.center.lon;
            } else {
                lat = 0; // fallback
                lon = 0;
            }
            
            const distance = lat && lon ? this.calculateDistance(
                this.currentLocation.latitude,
                this.currentLocation.longitude,
                lat,
                lon
            ) : 0;
            
            return `
                <div class="theater-card">
                    <div class="theater-info">
                        <h3><i class="fas fa-film"></i> ${name}</h3>
                        <p class="distance"><i class="fas fa-map-marker-alt"></i> ${distance > 0 ? `${distance.toFixed(1)} km away` : 'Nearby'}</p>
                        <p class="address">${theater.tags?.['addr:street'] || theater.tags?.['addr:housenumber'] ? 
                            `${theater.tags?.['addr:housenumber'] || ''} ${theater.tags?.['addr:street'] || ''}`.trim() : 
                            'Address not available'}</p>
                    </div>
                    <div class="theater-actions">
                        <button class="btn-primary" onclick="getDirections('${lat}', '${lon}')" ${lat === 0 ? 'disabled' : ''}>
                            <i class="fas fa-directions"></i> Directions
                        </button>
                        <button class="btn-secondary" onclick="showTheaterMovies('${name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-ticket-alt"></i> Showtimes
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        theatersGrid.innerHTML = theaterCards;
    }

    // Load default theaters (fallback)
    loadDefaultTheaters() {
        const theatersGrid = document.getElementById('theatersGrid');
        const loadingElement = document.getElementById('theatersLoading');
        
        loadingElement.style.display = 'none';
        
        // Enhanced default theaters with more realistic data
        const defaultTheaters = [
            { 
                name: 'PVR Cinemas', 
                distance: 2.1, 
                address: 'City Center Mall, Main Road',
                lat: 28.6139,
                lon: 77.2090
            },
            { 
                name: 'INOX Movies', 
                distance: 3.5, 
                address: 'Shopping Complex, MG Road',
                lat: 28.6140,
                lon: 77.2091
            },
            { 
                name: 'Cinepolis', 
                distance: 4.2, 
                address: 'Entertainment Zone, Sector 18',
                lat: 28.6141,
                lon: 77.2092
            },
            { 
                name: 'Carnival Cinemas', 
                distance: 5.8, 
                address: 'Multiplex Mall, Connaught Place',
                lat: 28.6142,
                lon: 77.2093
            }
        ];
        
        const theaterCards = defaultTheaters.map(theater => `
            <div class="theater-card">
                <div class="theater-info">
                    <h3><i class="fas fa-film"></i> ${theater.name}</h3>
                    <p class="distance"><i class="fas fa-map-marker-alt"></i> ${theater.distance} km away</p>
                    <p class="address">${theater.address}</p>
                </div>
                <div class="theater-actions">
                    <button class="btn-primary" onclick="getDirections('${theater.lat}', '${theater.lon}')">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    <button class="btn-secondary" onclick="showTheaterMovies('${theater.name}')">
                        <i class="fas fa-ticket-alt"></i> Showtimes
                    </button>
                </div>
            </div>
        `).join('');
        
        theatersGrid.innerHTML = theaterCards;
        console.log('Loaded default theaters as fallback');
    }

    // Calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Watch location changes
    startWatchingLocation() {
        if (navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('Location updated:', this.currentLocation);
                },
                (error) => console.error('Location watch error:', error),
                { enableHighAccuracy: true, maximumAge: 60000 }
            );
        }
    }

    // Stop watching location
    stopWatchingLocation() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}

// Global location manager instance
const locationManager = new LocationManager();

// Movie Data Manager
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

// GPS/Location Functions
async function detectLocation() {
    try {
        await locationManager.detectLocation();
    } catch (error) {
        console.error('Location detection failed:', error);
    }
}

function getDirections(lat, lon) {
    if (!locationManager.currentLocation) {
        alert('Please enable location access for directions');
        return;
    }
    
    const { latitude, longitude } = locationManager.currentLocation;
    const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${lat},${lon}`;
    window.open(url, '_blank');
}

function showTheaterMovies(theaterName) {
    alert(`Showtimes for ${theaterName} coming soon!`);
}

// Modal click handler
window.onclick = function (event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize location detection when page loads
let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    
    // Auto-detect location on page load
    setTimeout(() => {
        detectLocation();
    }, 2000);
    
    // Optional: Watch location changes
    locationManager.startWatchingLocation();
});

// Cleanup location watching when page unloads
window.addEventListener('beforeunload', () => {
    locationManager.stopWatchingLocation();
});
