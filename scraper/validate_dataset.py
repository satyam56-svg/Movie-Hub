"""Sanity-checks movies_integrated.json before it's loaded into the backend."""
import json
import os
import sys
from urllib.parse import urlparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DATASET_FILE = "movies_integrated.json"
REQUIRED_FIELDS = ["title", "description", "genre"]


def is_valid_url(url):
    if not url:
        return False
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def check_range(value, low, high, type_ok, label):
    if value is None:
        return []
    if not type_ok(value):
        return [f"{label} must be a number"]
    if not low <= value <= high:
        return [f"{label} must be between {low} and {high}"]
    return []


def validate_movie(movie):
    errors = [f"Missing field: {f}" for f in REQUIRED_FIELDS if f not in movie]

    title = movie.get("title")
    if not isinstance(title, str) or not title.strip():
        errors.append("Invalid title")

    if not isinstance(movie.get("description"), str):
        errors.append("Invalid description")

    if not isinstance(movie.get("genre"), str):
        errors.append("Invalid genre")

    errors += check_range(movie.get("tomatometer"), 0, 100, lambda v: isinstance(v, int), "Tomatometer")
    errors += check_range(movie.get("popcornmeter"), 0, 100, lambda v: isinstance(v, int), "Popcornmeter")
    errors += check_range(movie.get("metacriticScore"), 0, 100, lambda v: isinstance(v, (int, float)), "Metacritic score")
    errors += check_range(movie.get("metacriticUserScore"), 0, 10, lambda v: isinstance(v, (int, float)), "Metacritic user score")

    if movie.get("rtUrl") and not is_valid_url(movie["rtUrl"]):
        errors.append("Invalid Rotten Tomatoes URL")
    if movie.get("metacriticUrl") and not is_valid_url(movie["metacriticUrl"]):
        errors.append("Invalid Metacritic URL")

    return errors


def main():
    print("=" * 60)
    print("MovieHub - Dataset Validation")
    print("=" * 60)

    if not os.path.exists(DATASET_FILE):
        print(f"\nERROR: {DATASET_FILE} not found.")
        return

    try:
        with open(DATASET_FILE, "r", encoding="utf-8") as f:
            movies = json.load(f)
    except json.JSONDecodeError as e:
        print(f"\nERROR: Invalid JSON.\n{e}")
        return

    if not isinstance(movies, list) or not movies:
        print("\nERROR: Dataset must be a non-empty JSON array.")
        return

    print(f"Movies loaded: {len(movies)}\n")

    total_errors = 0
    titles = []

    for index, movie in enumerate(movies, start=1):
        errors = validate_movie(movie)
        title = movie.get("title", f"Movie {index}")
        titles.append(str(title).strip().lower())

        if errors:
            print(f"❌ Movie {index}: {title}")
            for error in errors:
                print(f"   - {error}")
            total_errors += len(errors)
        else:
            print(f"✅ Movie {index}: {title}")

    print("\nChecking duplicate titles...")
    seen, duplicates = set(), []
    for title in titles:
        if title in seen:
            duplicates.append(title)
        else:
            seen.add(title)

    if duplicates:
        print("❌ Duplicate movies found:")
        for title in duplicates:
            print(f"   - {title}")
        total_errors += len(duplicates)
    else:
        print("✅ No duplicate movie titles.")

    print("\nScore availability:")
    for field, label in [
        ("tomatometer", "Tomatometer"),
        ("popcornmeter", "Popcornmeter"),
        ("metacriticScore", "Metacritic"),
        ("metacriticUserScore", "Metacritic User Score"),
    ]:
        count = sum(m.get(field) is not None for m in movies)
        print(f"{label}: {count}/{len(movies)}")

    print("\n" + "=" * 60)
    if total_errors == 0:
        print("✅ DATASET VALIDATION PASSED")
        print(f"✅ {len(movies)} movies are valid, no duplicates, all scores/URLs in range.")
        print("\nDataset is ready for the next phase.")
    else:
        print("❌ DATASET VALIDATION FAILED")
        print(f"Total validation errors: {total_errors}")
        print("\nFix the errors before database integration.")


if __name__ == "__main__":
    main()
