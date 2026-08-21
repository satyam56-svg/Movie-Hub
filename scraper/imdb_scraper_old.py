"""
Scrapes the IMDb Top Chart: title, year, IMDb rating, poster, plot,
genre, director and top cast. This is the only source that discovers
*which* movies exist — Rotten Tomatoes and Metacritic only enrich
titles this scraper already found (see rt_scraper.py / metacritic_scraper.py).
"""
import json
import random
import re
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

IMDB_TOP_CHART_URL = "https://www.imdb.com/chart/top/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


class ImdbScraper:

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def get_page(self, url, delay=0.5):
        if delay > 0:
            time.sleep(delay + random.uniform(0.1, 0.3))
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"  Error fetching {url}: {e}")
            return None

    # ==========================================================
    # TOP CHART
    # ==========================================================

    def scrape_top_movies(self, limit=None):
        """Returns a list of dicts: title, year, imdbRating, poster, url,
        plot, genre, director, actors — one per movie, in chart order."""
        html = self.get_page(IMDB_TOP_CHART_URL)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        movies = self._parse_json_ld(soup, limit) or self._parse_dom(soup, limit)
        return movies

    # IMDb currently exposes the Top 250 list through JSON-LD. Try that first;
    # fall back to scraping the visible DOM if the page structure changes.
    def _parse_json_ld(self, soup, limit):
        movies = []

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.text)
            except (json.JSONDecodeError, TypeError):
                continue

            items = data.get("itemListElement") if isinstance(data, dict) else None
            if not isinstance(items, list):
                continue

            for item in items:
                info = item.get("item", {})
                if not isinstance(info, dict):
                    continue

                full_title = info.get("name", "").strip()
                if not full_title:
                    continue

                year = info.get("datePublished") or info.get("releaseDate") or "Unknown"
                if year != "Unknown":
                    year = str(year).split("-")[0]

                title = full_title
                year_match = re.search(r"\((\d{4})\)", full_title)
                if year_match:
                    if year == "Unknown" or len(str(year)) != 4:
                        year = year_match.group(1)
                    title = full_title.replace(f"({year_match.group(1)})", "").strip()

                rating = info.get("aggregateRating", {}).get("ratingValue", "0.0")
                poster = info.get("image", "")
                url = info.get("url", "")
                if url:
                    url = urljoin("https://www.imdb.com", url)

                movie = {
                    "title": title,
                    "year": str(year),
                    "imdbRating": str(rating),
                    "poster": poster,
                    "url": url,
                }
                if url:
                    movie.update(self.scrape_movie_details(url))

                movies.append(movie)
                if limit and len(movies) >= limit:
                    return movies

            if movies:
                return movies

        return None

    def _parse_dom(self, soup, limit):
        movies = []
        items = soup.select("li.ipc-metadata-list-summary-item") or soup.select(".lister-list tr")

        for item in items:
            title_el = item.select_one("h3.ipc-title__text") or item.select_one(".titleColumn a")
            if not title_el:
                continue

            raw_title = title_el.text.strip()
            title = raw_title.split(". ", 1)[1] if ". " in raw_title else raw_title

            year_el = item.select_one(".cli-title-metadata-item")
            year = year_el.text.strip() if year_el else "Unknown"

            rating_el = item.select_one("span.ipc-rating-star--rating")
            rating = rating_el.text.strip() if rating_el else "0.0"

            poster_el = item.select_one("img.ipc-image")
            poster = poster_el["src"] if poster_el and "src" in poster_el.attrs else ""

            link_el = item.select_one("a.ipc-title-link-wrapper")
            url = urljoin("https://www.imdb.com", link_el["href"]) if link_el else ""

            movie = {"title": title, "year": year, "imdbRating": rating, "poster": poster, "url": url}
            if url:
                movie.update(self.scrape_movie_details(url))

            movies.append(movie)
            if limit and len(movies) >= limit:
                break

        return movies

    # ==========================================================
    # PER-MOVIE DETAILS (plot, genre, director, cast)
    # ==========================================================

    def scrape_movie_details(self, url):
        html = self.get_page(url, delay=0.5)
        if not html:
            return {}

        soup = BeautifulSoup(html, "html.parser")
        details = {}

        try:
            json_ld = soup.find("script", type="application/ld+json")
            if json_ld:
                data = json.loads(json_ld.text)
                details["plot"] = data.get("description", "")
                genre = data.get("genre", "")
                details["genre"] = ", ".join(genre) if isinstance(genre, list) else genre
                directors = data.get("director") or [{}]
                details["director"] = directors[0].get("name", "") if directors else ""
                details["actors"] = [
                    {"name": a.get("name", "")} for a in data.get("actor", [])[:5] if a.get("name")
                ]
                return details

            plot_el = soup.select_one('span[data-testid="plot-xl"]')
            if plot_el:
                details["plot"] = plot_el.text.strip()

            genre_els = soup.select('div[data-testid="genres"] a')
            if genre_els:
                details["genre"] = ", ".join(g.text.strip() for g in genre_els)

            details["actors"] = []
            for container in soup.select('div[data-testid="title-cast-item"]')[:5]:
                name_el = container.select_one('a[data-testid="title-cast-item__actor"]')
                if name_el:
                    details["actors"].append({"name": name_el.text.strip()})

        except Exception as e:
            print(f"  Error scraping details for {url}: {e}")

        return details
