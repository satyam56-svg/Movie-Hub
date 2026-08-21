"""
For each movie discovered by imdb_scraper.py, finds its Rotten Tomatoes
page (by title + year search) and scrapes tomatometer, popcornmeter,
description, genre, runtime and release date.

Uses Playwright because RT is a JS-rendered site that blocks plain
requests/BeautifulSoup scraping.
"""

import re
from urllib.parse import quote

from playwright.sync_api import sync_playwright


BASE_URL = "https://www.rottentomatoes.com"


class RottenTomatoesScraper:

    def create_browser(self, playwright):

        browser = playwright.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )

        context = browser.new_context(
            viewport={
                "width": 1366,
                "height": 768
            },
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            locale="en-US"
        )

        page = context.new_page()

        page.add_init_script(
            "Object.defineProperty("
            "navigator, 'webdriver', "
            "{get: () => undefined})"
        )

        page.set_default_timeout(30000)

        return browser, context, page

    # ==========================================================
    # HELPERS
    # ==========================================================

    def clean_text(self, text):

        if not text:
            return None

        return re.sub(
            r"\s+",
            " ",
            text.replace("\xa0", " ")
        ).strip()

    def normalize_title(self, title):

        if not title:
            return ""

        text = (
            title
            .lower()
            .replace("\u2019", "'")
            .replace("\u2018", "'")
        )

        text = re.sub(
            r"\(.*?\)",
            "",
            text
        )

        text = re.sub(
            r"[^a-z0-9\s]",
            "",
            text
        )

        return re.sub(
            r"\s+",
            " ",
            text
        ).strip()

    # ==========================================================
    # FIND RT PAGE
    # ==========================================================

    def search_rt_for_movie(
            self,
            page,
            title,
            year=None
    ):
        """
        Strict title match (+/- 1 year)
        to avoid false positives.
        """

        search_url = (
            f"{BASE_URL}/search"
            f"?search={quote(title)}"
        )

        try:

            page.goto(
                search_url,
                wait_until="domcontentloaded",
                timeout=30000
            )

            rows = page.locator(
                "search-page-media-row"
            )

            # Wait only until the first result exists.
            rows.first.wait_for(
                state="attached",
                timeout=8000
            )

        except Exception as e:

            print(
                f"  RT search failed for "
                f"'{title}': {e}"
            )

            return None

        target_norm = self.normalize_title(title)

        for row in rows.all():

            try:

                name_link = row.locator(
                    'a[data-qa="info-name"]'
                )

                if name_link.count() == 0:
                    continue

                candidate_title = (
                    name_link.first
                    .inner_text()
                    .strip()
                )

                href = (
                    name_link.first
                    .get_attribute("href")
                )

                if not href:
                    continue

                href_clean = (
                    href
                    .split("?")[0]
                    .split("#")[0]
                )

                if not re.match(
                        r"^https://www\.rottentomatoes\.com/m/[^/]+$",
                        href_clean
                ):
                    continue

                # Exact normalized title match.
                if (
                        self.normalize_title(
                            candidate_title
                        )
                        != target_norm
                ):
                    continue

                # Year protection.
                if year is not None:

                    row_year_str = row.get_attribute(
                        "release-year"
                    )

                    if row_year_str:

                        try:

                            if abs(
                                    int(row_year_str)
                                    - int(year)
                            ) > 1:

                                continue

                        except (
                                ValueError,
                                TypeError
                        ):
                            pass

                return href_clean

            except Exception:
                continue

        return None

    # ==========================================================
    # PAGE EXTRACTION
    # ==========================================================

    def extract_title(self, page):

        try:

            locator = page.locator("h1")

            if locator.count() > 0:

                return self.clean_text(
                    locator.first.inner_text()
                )

        except Exception:
            pass

        return None

    def extract_metadata(self, body_text):

        """
        Parses metadata line into:

        release_date
        runtime
        genre
        """

        release_date = None
        runtime = None
        genre = None

        try:

            lines = [
                self.clean_text(line)
                for line in body_text.splitlines()
                if self.clean_text(line)
            ]

            for line in lines:

                if (
                        "m" not in line
                        and "h" not in line
                ):
                    continue

                if not re.search(
                        r"\b\d+h\s+\d+m\b"
                        r"|\b\d+h\b"
                        r"|\b\d+m\b",
                        line
                ):
                    continue

                parts = [
                    self.clean_text(part)
                    for part in line.split(",")
                    if self.clean_text(part)
                ]

                if len(parts) < 2:
                    continue

                runtime_index = next(
                    (
                        i
                        for i, part in enumerate(parts)
                        if re.fullmatch(
                        r"\d+h(?:\s+\d+m)?",
                        part
                    )
                    ),
                    None
                )

                if runtime_index is not None:

                    runtime = parts[
                        runtime_index
                    ]

                    if (
                            runtime_index + 1
                            < len(parts)
                    ):

                        genre = self.clean_text(
                            re.sub(
                                r"\s*PLAYTRAILER.*$",
                                "",
                                ",".join(
                                    parts[
                                        runtime_index + 1:
                                    ]
                                ),
                                flags=re.IGNORECASE
                            )
                        )

                release_date = parts[1]

                break

        except Exception:
            pass

        return (
            release_date,
            runtime,
            genre
        )

    def extract_description(
            self,
            body_text
    ):

        ignored = {
            "Where to Watch",
            "What to Know",
            "Reviews",
            "Cast & Crew",
            "Videos",
            "Photos",
            "Media Info",
            "Where To Watch",
            "Popcornmeter",
            "Tomatometer",
        }

        try:

            lines = [
                self.clean_text(line)
                for line in body_text.splitlines()
                if self.clean_text(line)
            ]

            anchor = None

            for i, line in enumerate(lines):

                if line in (
                        "Popcornmeter",
                        "Tomatometer",
                        "What to Know"
                ):

                    anchor = i

            start = (
                anchor + 1
                if anchor is not None
                else 0
            )

            for line in lines[start:]:

                if (
                        line in ignored
                        or re.search(
                    r"ReviewsTomatometer"
                    r"|Verified Ratings"
                    r"|Popcornmeter",
                    line,
                    re.I
                )
                ):
                    continue

                if len(line) >= 50:
                    return self.clean_text(line)

        except Exception:
            pass

        return None

    def extract_tomatometer(
            self,
            page,
            body_text
    ):

        try:

            body_text = re.sub(
                r"\s+",
                " ",
                body_text
            )

            match = re.search(
                r"(\d{1,3})%"
                r"[\d\s,+]*"
                r"(?:Reviews?)?"
                r"\s*Tomatometer",
                body_text,
                re.I
            )

            if match:

                value = int(
                    match.group(1)
                )

                return (
                    value
                    if 0 <= value <= 100
                    else None
                )

        except Exception:
            pass

        return None

    def extract_popcornmeter(
            self,
            body_text
    ):

        try:

            body_text = re.sub(
                r"\s+",
                " ",
                body_text
            )

            popcorn_pos = re.search(
                r"Popcornmeter",
                body_text,
                re.I
            )

            if not popcorn_pos:
                return None

            tomatometer_pos = re.search(
                r"Tomatometer",
                body_text,
                re.I
            )

            if tomatometer_pos:

                segment = body_text[
                    tomatometer_pos.end():
                    popcorn_pos.start()
                ]

            else:

                segment = body_text[
                    max(
                        0,
                        popcorn_pos.start() - 200
                    ):
                    popcorn_pos.start()
                ]

            matches = re.findall(
                r"(\d{1,3})%",
                segment
            )

            if matches:

                value = int(
                    matches[-1]
                )

                return (
                    value
                    if 0 <= value <= 100
                    else None
                )

        except Exception:
            pass

        return None

    # ==========================================================
    # MOVIE PAGE
    # ==========================================================

    def extract_movie(
            self,
            page,
            url
    ):

        if not url:
            return None

        try:

            response = page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=30000
            )

            if (
                    response is None
                    or response.status != 200
            ):
                return None

            body_text = page.locator(
                "body"
            ).inner_text()

            (
                release_date,
                runtime,
                genre
            ) = self.extract_metadata(
                body_text
            )

            return {
                "title": self.extract_title(page),

                "description":
                    self.extract_description(
                        body_text
                    ),

                "genre": genre,

                "releaseDate":
                    release_date,

                "runtime":
                    runtime,

                "tomatometer":
                    self.extract_tomatometer(
                        page,
                        body_text
                    ),

                "popcornmeter":
                    self.extract_popcornmeter(
                        body_text
                    ),

                "rtUrl": url,
            }

        except Exception as e:

            print(
                f"    RT movie page failed: {e}"
            )

            return None

    # ==========================================================
    # BATCH
    # ==========================================================

    def scrape_movies(
            self,
            imdb_movies
    ):

        """
        Returns a same-length, same-order
        list of RT result dictionaries.
        """

        results = []
        matched = 0

        with sync_playwright() as playwright:

            browser, context, page = (
                self.create_browser(
                    playwright
                )
            )

            try:

                total = len(imdb_movies)

                for index, movie in enumerate(
                        imdb_movies,
                        start=1
                ):

                    title = movie.get(
                        "title",
                        ""
                    )

                    year = (
                            movie.get("year")
                            or movie.get("releaseYear")
                    )

                    empty = {
                        "title": title,
                        "description": None,
                        "genre": None,
                        "releaseDate": None,
                        "runtime": None,
                        "tomatometer": None,
                        "popcornmeter": None,
                        "rtUrl": None,
                    }

                    if not title:

                        results.append(empty)
                        continue

                    print(
                        f"  [{index}/{total}] "
                        f"RT: '{title}' ({year})"
                    )

                    try:

                        rt_url = (
                            self.search_rt_for_movie(
                                page,
                                title,
                                year
                            )
                        )

                        scraped = (
                            self.extract_movie(
                                page,
                                rt_url
                            )
                            if rt_url
                            else None
                        )

                        results.append(
                            scraped or empty
                        )

                        if scraped:
                            matched += 1

                    except Exception as e:

                        print(
                            f"    RT scrape failed: {e}"
                        )

                        results.append(empty)

                # No fixed sleep here.
                # The next navigation itself provides
                # the necessary pacing.

            finally:

                context.close()
                browser.close()

        print(
            f"  RT matched: "
            f"{matched}/{len(imdb_movies)}"
        )

        return results