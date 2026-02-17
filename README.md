# Movie Rating Portal

A comprehensive movie rating aggregator that scrapes and displays ratings from IMDb, Rotten Tomatoes, and Metacritic.

## Project Structure

```
Movie_rating/
├── frontend/           # Frontend files
│   ├── index.html     # Main UI
│   ├── script.js      # Frontend logic
│   └── styles.css     # Styling
├── scraper/           # Scraping scripts
│   ├── scraper.py     # Main scraper
│   └── requirements.txt
├── data/              # Scraped data
│   ├── movie_data.json
│   └── movie_data.csv
├── index.html         # Root redirect
└── README.md          # This file
```

## Running the Project

1. **Start the server:**
   ```bash
   python -m http.server 8000
   ```

2. **Access the portal:**
   Open http://localhost:8000/ in your browser

3. **Run the scraper:**
   ```bash
   cd scraper
   python scraper.py
   ```

## Features

- ✓ Scrapes 200+ movies from IMDb Top 250
- ✓ Fetches Rotten Tomatoes and Metacritic ratings
- ✓ Fuzzy title matching for accurate data merging
- ✓ Beautiful, responsive UI
- ✓ Multi-page scraping for better coverage
