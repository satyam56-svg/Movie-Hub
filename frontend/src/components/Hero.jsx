function Hero({ onSearch }) {
    const handleSearch = () => {
        const input = document.getElementById('searchInput')
        const term = input?.value.trim() || ''

        onSearch(term)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <section id="home" className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>Discover & Rate Your Next Favorite Movie</h1>

                    <p>
                        Explore top rated titles, IMDb & Rotten Tomatoes scores, nearby theaters, user reviews, and custom watchlists.
                    </p>

                    <div className="search-box">
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Search by title, director, or keyword..."
                            autoComplete="off"
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="button"
                            id="searchButton"
                            onClick={handleSearch}
                            aria-label="Search movies"
                        >
                            <i className="fas fa-search"></i>
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero