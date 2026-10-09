"""
MovieHub Scraper Pipeline

Flow:
1. Load IMDb Top 250 base dataset from imdb_top250.json
2. Enrich each movie with Rotten Tomatoes data
3. Enrich each movie with Metacritic data
4. Build final MovieHub records
5. Save movies_integrated.json
"""

import argparse
import json
import re
import time

from metacritic_scraper import MetacriticScraper
from rt_scraper import RottenTomatoesScraper


INPUT_FILE = "imdb_top250.json"
OUTPUT_FILE = "movies_integrated.json"


def to_int_score(value, max_val=100):
    if value is None:
        return None

    try:
        val = int(float(value))
        return val if 0 <= val <= max_val else None
    except (TypeError, ValueError):
        return None


def to_float_score(value, max_val=10.0):
    if value is None:
        return None

    try:
        val = float(value)
        return val if 0.0 <= val <= max_val else None
    except (TypeError, ValueError):
        return None


def extract_year(raw_year):
    if not raw_year:
        return 0

    match = re.search(r"\b(19\d{2}|20\d{2})\b", str(raw_year))
    return int(match.group(1)) if match else 0


def load_imdb_movies(limit=None):
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        movies = json.load(f)

    if limit:
        movies = movies[:limit]

    return movies


def build_movie_record(imdb, rt, mc):
    """Build the final MovieHub movie structure."""

    rt = rt or {}
    mc = mc or {}

    imdb_rating = to_float_score(imdb.get("imdbRating"))

    return {
        "title": imdb.get("title", "").strip(),

        "description": "",

        "genre": "Drama",

        "rating": imdb_rating if imdb_rating is not None else 0.0,

        "releaseYear": extract_year(imdb.get("year")),

        "posterUrl": imdb.get("poster") or imdb.get("posterUrl") or "",

        "imdbRating": imdb_rating,

        "tomatometer": to_int_score(
            rt.get("tomatometer")
        ),

        "popcornmeter": to_int_score(
            rt.get("popcornmeter")
        ),

        "metacriticScore": to_int_score(
            mc.get("metacriticScore")
        ),

        "metacriticUserScore": to_float_score(
            mc.get("metacriticUserScore")
        ),

        "releaseDate": (
                rt.get("releaseDate")
                or str(imdb.get("year") or "")
        ),

        "runtime": rt.get("runtime") or "",

        "director": "",

        "cast": "",

        "rtUrl": rt.get("rtUrl"),

        "metacriticUrl": mc.get("metacriticUrl"),
    }


def run(limit=None):

    pipeline_start = time.perf_counter()
    print("=" * 60)
    print("MovieHub Scraper Pipeline")
    print("=" * 60)

    # ----------------------------------------------------------
    # 1. LOAD IMDb BASE DATASET
    # ----------------------------------------------------------

    print("\n[1/4] Loading IMDb Top 250 dataset...")

    imdb_movies = load_imdb_movies(limit)

    print(
        f"IMDb base movies loaded: {len(imdb_movies)}"
    )

    # ----------------------------------------------------------
    # 2. ROTTEN TOMATOES
    # ----------------------------------------------------------

    print(
        "\n[2/4] Enriching with Rotten Tomatoes..."
    )

    rt_start = time.perf_counter()

    rt_scraper = RottenTomatoesScraper()

    rt_results = rt_scraper.scrape_movies(
        imdb_movies
    )

    rt_elapsed = time.perf_counter() - rt_start

    print(
        f"RT results received: {len(rt_results)}"
    )

    print(
        f"RT scraping time: {rt_elapsed:.2f} seconds"
    )


    # ----------------------------------------------------------
    # 3. METACRITIC
    # ----------------------------------------------------------

    print(
        "\n[3/4] Enriching with Metacritic..."
    )

    mc_start = time.perf_counter()

    metacritic_scraper = MetacriticScraper()

    mc_results = metacritic_scraper.scrape_movies(
        imdb_movies
    )

    mc_elapsed = time.perf_counter() - mc_start


    print(
        f"Metacritic results received: {len(mc_results)}"
    )

    print(
        f"Metacritic scraping time: {mc_elapsed:.2f} seconds"
    )


    # ----------------------------------------------------------
    # 4. BUILD FINAL DATASET
    # ----------------------------------------------------------

    print(
        "\n[4/4] Building final dataset..."
    )

    movies = []

    for imdb, rt, mc in zip(
            imdb_movies,
            rt_results,
            mc_results
    ):
        movie = build_movie_record(
            imdb,
            rt,
            mc
        )

        movies.append(movie)

    with open(
            OUTPUT_FILE,
            "w",
            encoding="utf-8"
    ) as f:

        json.dump(
            movies,
            f,
            indent=2,
            ensure_ascii=False
        )

    print(
        f"\nSaved {len(movies)} movies to "
        f"{OUTPUT_FILE}"
    )

    print(
        "\nNext: python validate_dataset.py"
    )

    total_elapsed = time.perf_counter() - pipeline_start

    print(
        f"\nTotal pipeline time: {total_elapsed:.2f} seconds"
    )

    print(
        f"Total pipeline time: {total_elapsed / 60:.2f} minutes"
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="MovieHub scraper pipeline"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only process first N movies"
    )

    args = parser.parse_args()

    run(limit=args.limit)