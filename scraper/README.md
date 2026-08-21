# MovieHub Scraper (simplified)

## What changed from the old folder

Old folder had 6 scripts with overlapping jobs:
- `scraper.py` — scraped IMDb **and** a weaker/older version of RT + Metacritic
- `scraper_v3.py` — a separate, better Playwright-based RT scraper
- `metacritic_scraper.py` — a separate Playwright-based Metacritic scraper, but only had a "scrape one test movie" entrypoint, not a real batch mode
- `movie_integrator.py` — merged/deduped movies with fuzzy title matching, because `scraper.py` scraped RT/Metacritic as separate, un-linked lists that needed reconciling against the IMDb list
- `validate_dataset.py` — validated the final JSON
- `test_rt_page.py` — a one-off test script

The RT/Metacritic scraping in `scraper.py` was redundant with `scraper_v3.py`/`metacritic_scraper.py`, and `movie_integrator.py`'s fuzzy matching only existed to fix mismatches from that redundant approach. `requirements.txt` was also missing `playwright`, which two of the scripts actually needed to run.

## New structure — one job per file, no dead code

| File | Responsibility |
|---|---|
| `imdb_scraper.py` | Discovers movies from IMDb's Top Chart (title, year, rating, poster, plot, genre, director, cast) |
| `rt_scraper.py` | For each IMDb movie, finds and scrapes its Rotten Tomatoes page |
| `metacritic_scraper.py` | For each IMDb movie, finds and scrapes its Metacritic page |
| `pipeline.py` | Runs all three in order and merges them into `movies_integrated.json` |
| `validate_dataset.py` | Sanity-checks the final JSON before it goes to the backend |

Because RT and Metacritic are now always searched *per IMDb movie* (title + year), their results come back already aligned 1:1 with the IMDb list — no separate "merge 3 unrelated lists and fuzzy-match titles" step is needed anymore, so `movie_integrator.py` is gone entirely.

## Usage

```bash
pip install -r requirements.txt
playwright install chromium   # one-time browser download for RT/Metacritic

python pipeline.py            # full run — scrapes IMDb Top 250 + enriches all of them
python pipeline.py --limit 10 # quick smoke test on just the first 10 movies

python validate_dataset.py    # check movies_integrated.json before loading it into the DB
```

`movies_integrated.json` is the file `MovieDataLoader.java` reads on backend startup.

## Note

This scrapes IMDb, Rotten Tomatoes, and Metacritic, all of which may change their page structure or block automated requests over time — some of the extraction logic (especially RT's tomatometer/popcornmeter parsing) relies on fragile text-position heuristics because that's what the sites' markup allows. If a scrape run comes back with a lot of `null` scores, the site's HTML has likely changed and the relevant `extract_*` method in `rt_scraper.py` / `metacritic_scraper.py` needs a look.
