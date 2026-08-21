"""
For each movie discovered by imdb_scraper.py, finds its Metacritic page
(by title search) and scrapes the Metascore and user score.

Uses Playwright because Metacritic is a JS-rendered site.
"""
import re
import time
from urllib.parse import quote, urljoin

from playwright.sync_api import sync_playwright

BASE_URL = "https://www.metacritic.com"


class MetacriticScraper:

    def create_browser(self, playwright):
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1366, "height": 768},
            locale="en-US"
        )
        page = context.new_page()
        page.set_default_timeout(10000)
        # Block resources that are not required for score extraction.
        def handle_route(route):
            resource_type = route.request.resource_type

            if resource_type in {
                "image",
                "media",
                "font"
            }:
                route.abort()
            else:
                route.continue_()

        page.route("**/*", handle_route)

        return browser, context, page

    def clean_text(self, text):
        if not text:
            return None
        return re.sub(r"\s+", " ", text).strip()

    def normalize_title(self, title):
        if not title:
            return ""
        title = self.clean_text(title).lower().replace("\u2019", "'")
        title = re.sub(r"[^a-z0-9\s]", "", title)
        return re.sub(r"\s+", " ", title).strip()

    # ==========================================================
    # FIND THE METACRITIC PAGE FOR ONE MOVIE
    # ==========================================================

    def find_movie_url(self, page, title):

        start = time.perf_counter()

        search_url = f"{BASE_URL}/search/{quote(title)}/"

        goto_start = time.perf_counter()

        response = page.goto(
            search_url,
            wait_until="domcontentloaded",
            timeout=20000
        )

        goto_time = time.perf_counter() - goto_start

        if response is None or response.status != 200:
            print(
                f"    Search page load: {goto_time:.2f}s"
            )
            return None

        links_start = time.perf_counter()

        links = page.locator(
            'a[href^="/movie/"]'
        ).all()

        links_time = time.perf_counter() - links_start

        target = self.normalize_title(title)

        target_slug = re.sub(
            r"[^a-z0-9]+",
            "-",
            title.lower()
        ).strip("-")

        for matcher in (
                lambda t, _: self.normalize_title(t) == target,
                lambda t, _: target in self.normalize_title(t),
                lambda _, slug: slug == target_slug,
        ):
            for link in links:
                try:
                    href = link.get_attribute("href")

                    if not href or href == "/movie/":
                        continue

                    raw_text = link.inner_text()

                    slug_match = re.match(
                        r"^/movie/([^/]+)/?$",
                        href
                    )

                    slug = (
                        slug_match.group(1).lower()
                        if slug_match
                        else ""
                    )

                    if matcher(raw_text, slug):

                        movie_url = urljoin(
                            BASE_URL,
                            href.split("?")[0].split("#")[0]
                        )

                        print(f"    URL found: {movie_url}")

                        return movie_url

                except Exception:
                    continue

        total_time = time.perf_counter() - start

        print(
            f"    Search: {goto_time:.2f}s | "
            f"Links: {links_time:.2f}s | "
            f"No match: {total_time:.2f}s"
        )

        return None

    # ==========================================================
    # PAGE EXTRACTION
    # ==========================================================

    def extract_scores(self, page):
        metascore, user_score = None, None
        try:
            scores = []
            for el in page.locator('span[data-testid="global-score-value"]').all():
                try:
                    value = self.clean_text(el.inner_text())
                    if value and value not in scores:
                        scores.append(value)
                except Exception:
                    continue

            for score in scores:
                try:
                    value = int(score)
                    if 0 <= value <= 100:
                        metascore = value
                        break
                except ValueError:
                    continue

            for score in scores:
                try:
                    value = float(score)
                    if 0 <= value <= 10:
                        user_score = value
                        break
                except ValueError:
                    continue
        except Exception as e:
            print(f"    Score extraction error: {e}")

        return metascore, user_score

    def extract_movie(self, page, title, url):

        start = time.perf_counter()

        response = page.goto(
            url,
            wait_until="domcontentloaded",
            timeout=20000
        )

        page_load_time = time.perf_counter() - start

        if response is None or response.status != 200:
            print(
                f"    Movie page load: "
                f"{page_load_time:.2f}s"
            )
            return None

        extraction_start = time.perf_counter()

        metascore, user_score = self.extract_scores(page)

        extraction_time = (
                time.perf_counter() - extraction_start
        )

        total_time = time.perf_counter() - start

        print(
            f"    Movie page: {page_load_time:.2f}s | "
            f"Extraction: {extraction_time:.2f}s | "
            f"Total: {total_time:.2f}s"
        )

        return {
            "title": title,
            "metacriticScore": metascore,
            "metacriticUserScore": user_score,
            "metacriticUrl": url,
        }

    # ==========================================================
    # BATCH: ONE RESULT PER INPUT MOVIE, SAME ORDER
    # ==========================================================

    def scrape_movies(self, imdb_movies):
        """Same contract as RottenTomatoesScraper.scrape_movies: a
        same-length, same-order list of result dicts, all-None fields for
        movies that couldn't be found/scraped."""
        results = []
        matched = 0

        with sync_playwright() as playwright:
            browser, context, page = self.create_browser(playwright)
            try:
                total = len(imdb_movies)
                for index, movie in enumerate(imdb_movies, start=1):
                    title = movie.get("title", "")
                    empty = {
                        "title": title, "metacriticScore": None,
                        "metacriticUserScore": None, "metacriticUrl": None,
                    }

                    if not title:
                        results.append(empty)
                        continue

                    print(f"  [{index}/{total}] Metacritic: '{title}'")
                    try:
                        url = self.find_movie_url(page, title)
                        scraped = self.extract_movie(page, title, url) if url else None
                        results.append(scraped or empty)
                        if scraped:
                            matched += 1
                    except Exception as e:
                        print(f"    Metacritic scrape failed: {e}")
                        results.append(empty)

                    # time.sleep(1.5)  # polite delay between movies
            finally:
                context.close()
                browser.close()

        print(f"  Metacritic matched: {matched}/{len(imdb_movies)}")
        return results
