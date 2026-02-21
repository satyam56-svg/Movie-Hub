import requests
from bs4 import BeautifulSoup
import json
import time
import random
from urllib.parse import urljoin, quote
import csv
import re

class MovieScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def get_page(self, url, delay=0.5):
        if delay > 0:
            time.sleep(delay + random.uniform(0.1, 0.3)) 
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None

    def scrape_imdb_top_movies(self):
        url = "https://www.imdb.com/chart/top/"
        html = self.get_page(url)
        
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        movies = []

        try:
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                data = json.loads(json_ld.text)
                if 'itemListElement' in data:
                    # Reduced limit for speed - only top 50 movies
                    for item in data['itemListElement'][:50]:
                        movie_info = item.get('item', {})
                        full_title = movie_info.get('name', 'Unknown')
                        year = movie_info.get('datePublished', movie_info.get('releaseDate', 'Unknown'))
                        
                        if year != 'Unknown':
                            year = year.split('-')[0]
                        
                        title = full_title
                        year_match = re.search(r'\((\d{4})\)', full_title)
                        if year_match:
                            if year == 'Unknown' or len(year) != 4:
                                year = year_match.group(1)
                            title = full_title.replace(f"({year})", "").strip()
                        
                        rating = movie_info.get('aggregateRating', {}).get('ratingValue', '0.0')
                        poster = movie_info.get('image', '')
                        
                        if poster and '_V1_' in poster:
                            poster = re.sub(r'._V1_.*?.jpg', '._V1_.jpg', poster)
                            
                        movie_url = movie_info.get('url', '')
                        if movie_url:
                            movie_url = urljoin("https://www.imdb.com", movie_url)
                        
                        # Limit details scraping to top 30 movies for speed
                        details = {}
                        if movie_url and len(movies) < 30:
                            details = self.scrape_imdb_movie_details(movie_url)
                        
                        movie_item = {
                            'title': title,
                            'year': str(year),
                            'imdbRating': str(rating),
                            'source': 'IMDb',
                            'poster': poster,
                            'url': movie_url
                        }
                        movie_item.update(details)
                        movies.append(movie_item)
                    return movies

            movie_items = soup.select('li.ipc-metadata-list-summary-item')
            if not movie_items:
                 movie_items = soup.select('.lister-list tr')
            
            # Reduced limit for speed
            for item in movie_items[:50]:
                try:
                    title_element = item.select_one('h3.ipc-title__text')
                    if not title_element:
                        title_element = item.select_one('.titleColumn a')
                    
                    if not title_element:
                        continue
                        
                    raw_title = title_element.text.strip()
                    if '. ' in raw_title:
                        title = raw_title.split('. ', 1)[1]
                    else:
                        title = raw_title
                    
                    yr_el = item.select_one('.cli-title-metadata-item')
                    year = yr_el.text.strip() if yr_el else "Unknown"
                    
                    if year == "Unknown":
                        meta_items = item.select('.cli-title-metadata-item')
                        for meta in meta_items:
                            text = meta.text.strip()
                            if re.match(r'^\d{4}$', text):
                                year = text
                                break
                    
                    rating_element = item.select_one('span.ipc-rating-star--rating')
                    rating = rating_element.text.strip() if rating_element else "0.0"
                    
                    poster_element = item.select_one('img.ipc-image')
                    poster = poster_element['src'] if poster_element and 'src' in poster_element.attrs else ""
                    
                    link_element = item.select_one('a.ipc-title-link-wrapper')
                    movie_url = urljoin("https://www.imdb.com", link_element['href']) if link_element else ""
                    
                    details = {}
                    if movie_url:
                        details = self.scrape_imdb_movie_details(movie_url)

                    movie_item = {
                        'title': title,
                        'year': year,
                        'imdbRating': rating,
                        'source': 'IMDb',
                        'poster': poster
                    }
                    movie_item.update(details)
                    movies.append(movie_item)
                except Exception as e:
                    print(f"Error parsing movie item: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping IMDb: {e}")
            movies = self.get_sample_imdb_data()

        return movies

    def scrape_imdb_movie_details(self, url):
        html = self.get_page(url, delay=1)
        if not html:
            return {}
        
        soup = BeautifulSoup(html, 'html.parser')
        details = {}
        
        try:
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                data = json.loads(json_ld.text)
                details['plot'] = data.get('description', '')
                details['genre'] = ", ".join(data.get('genre', [])) if isinstance(data.get('genre'), list) else data.get('genre', '')
                details['director'] = data.get('director', [{}])[0].get('name', '') if data.get('director') else ''
                
                # Extract year from detail page JSON-LD
                year_raw = data.get('datePublished', data.get('releaseDate', ''))
                if year_raw:
                    details['year'] = year_raw.split('-')[0]
                
                details['actors'] = []
                for actor_data in data.get('actor', [])[:5]:
                    details['actors'].append({
                        'name': actor_data.get('name', ''),
                        'photo': ''
                    })
                
                actor_containers = soup.select('div[data-testid="title-cast-item"]')
                for i, container in enumerate(actor_containers[:5]):
                    if i < len(details['actors']):
                        img = container.select_one('img')
                        if img and 'src' in img.attrs:
                            details['actors'][i]['photo'] = img['src']
                
                return details

            plot_el = soup.select_one('span[data-testid="plot-xl"]')
            if plot_el:
                details['plot'] = plot_el.text.strip()
                
            genre_els = soup.select('div[data-testid="genres"] a')
            if genre_els:
                details['genre'] = ", ".join([g.text.strip() for g in genre_els])
            
            # Extract year from detail page DOM if not already found
            if 'year' not in details:
                year_el = soup.select_one('a[href*="/releaseinfo"]')
                if year_el and re.match(r'^\d{4}$', year_el.text.strip()):
                    details['year'] = year_el.text.strip()
            
            details['actors'] = []
            # Limit actor extraction to 3 for speed
            actor_containers = soup.select('div[data-testid="title-cast-item"]')
            for container in actor_containers[:3]:
                name_el = container.select_one('a[data-testid="title-cast-item__actor"]')
                img_el = container.select_one('img')
                if name_el:
                    details['actors'].append({
                        'name': name_el.text.strip(),
                        'photo': img_el['src'] if img_el and 'src' in img_el.attrs else ''
                    })
                
        except Exception as e:
            print(f"Error scraping movie details for {url}: {e}")
            
        return details

    def scrape_rotten_tomatoes_movies(self, pages=5):
        movies = []
        # Try multiple sorts to cover more ground (popular and highest rated)
        sorts = ['popular', 'critic_highest']
        for sort in sorts:
            for page in range(1, pages + 1):
                url = f"https://www.rottentomatoes.com/browse/movies_at_home/sort:{sort}?page={page}"
                html = self.get_page(url)
                if not html: continue
            
            soup = BeautifulSoup(html, 'html.parser')
            try:
                # 1. Try JSON-LD first (most reliable)
                json_scripts = soup.find_all('script', type='application/ld+json')
                found_in_page = False
                for script in json_scripts:
                    try:
                        data = json.loads(script.text)
                        # Look for ItemList containing Movies
                        items_container = data.get('itemListElement', {})
                        if isinstance(items_container, dict) and 'itemListElement' in items_container:
                            raw_items = items_container['itemListElement']
                            for item in raw_items:
                                if item.get('@type') == 'Movie':
                                    title = item.get('name')
                                    score = item.get('aggregateRating', {}).get('ratingValue')
                                    if score:
                                        movies.append({
                                            'title': title,
                                            'rotten_tomatoes_score': f"{score}%",
                                            'source': 'Rotten Tomatoes',
                                            'poster': item.get('image', '')
                                        })
                            found_in_page = True
                    except: continue
                
                if found_in_page: continue

                # 2. Try embedded context JSON
                script_tags = soup.find_all('script')
                for script in script_tags:
                    content = script.text
                    if 'root.RottenTomatoes.context' in content:
                        json_match = re.search(r'root\.RottenTomatoes\.context\s*=\s*(\{.*?\});', content, re.DOTALL)
                        if json_match:
                            try:
                                data = json.loads(json_match.group(1))
                                def find_items(d):
                                    if isinstance(d, dict):
                                        if 'items' in d and isinstance(d['items'], list):
                                            if len(d['items']) > 0 and ('title' in d['items'][0] or 'name' in d['items'][0]):
                                                return d['items']
                                        for v in d.values():
                                            res = find_items(v)
                                            if res: return res
                                    elif isinstance(d, list):
                                        for i in d:
                                            res = find_items(i)
                                            if res: return res
                                    return None

                                items = find_items(data)
                                if items:
                                    for item in items:
                                        title = item.get('title') or item.get('name')
                                        score = item.get('criticsScore', {}).get('value')
                                        if score is not None:
                                            movies.append({
                                                'title': title,
                                                'rotten_tomatoes_score': f"{score}%",
                                                'source': 'Rotten Tomatoes',
                                                'poster': item.get('mainImage', {}).get('url', '')
                                            })
                                    found_in_page = True
                            except: pass
                
                if found_in_page: continue

                # 3. Fallback to DOM
                grid_items = soup.select('tile-poster-default') or soup.select('div.discovery-media-card')
                for item in grid_items:
                    title_el = item.select_one('span[data-qa="discovery-media-card-title"]') or item.select_one('.p--small')
                    score_el = item.select_one('rt-text[slot="criticsScore"]') or item.select_one('span.tomatometer')
                    if title_el:
                        movies.append({
                            'title': title_el.text.strip(),
                            'rotten_tomatoes_score': score_el.text.strip() if score_el else "0%",
                            'source': 'Rotten Tomatoes',
                            'poster': item.find('img').get('src', '') if item.find('img') else ""
                        })
            except Exception as e:
                print(f"Error scraping RT page {page}: {e}")
        
        return movies if movies else self.get_sample_rt_data()

    def scrape_metacritic_movies(self, pages=4):
        movies = []
        for page in range(1, pages + 1):
            url = f"https://www.metacritic.com/browse/movie/all/all/all/metascore/desc/?page={page}"
            html = self.get_page(url)
            if not html: continue
            
            soup = BeautifulSoup(html, 'html.parser')
            try:
                json_ld = soup.find('script', type='application/ld+json')
                if json_ld:
                    data = json.loads(json_ld.text)
                    if 'itemListElement' in data:
                        for item in data['itemListElement']:
                            movie_info = item.get('item', {})
                            title = movie_info.get('name', 'Unknown')
                            score = movie_info.get('aggregateRating', {}).get('ratingValue', '0')
                            movies.append({
                                'title': title,
                                'metacritic_score': str(score),
                                'source': 'Metacritic',
                                'poster': movie_info.get('image', '')
                            })
                        continue

                # DOM fallback
                cards = soup.select('.c-finderProductCard') or soup.select('tr.c-finderProductRow')
                for card in cards:
                    title_el = card.select_one('.c-finderProductCard_title span:nth-child(2)') or card.select_one('h3.c-finderProductCard_title')
                    score_el = card.select_one('.c-siteReviewScore span') or card.select_one('div.c-finderProductCard_score')
                    if title_el:
                        movies.append({
                            'title': title_el.text.strip(),
                            'metacritic_score': score_el.text.strip() if score_el else "0",
                            'source': 'Metacritic',
                            'poster': card.find('img').get('src', '') if card.find('img') else ""
                        })
            except Exception as e:
                print(f"Error scraping Metacritic page {page}: {e}")
                
        return movies if movies else self.get_sample_metacritic_data()

    def get_sample_imdb_data(self):
        return [
            {'title': 'The Shawshank Redemption', 'year': '1994', 'imdbRating': '9.3', 'source': 'IMDb', 'genre': 'Drama', 'poster': 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg'},
            {'title': 'The Godfather', 'year': '1972', 'imdbRating': '9.2', 'source': 'IMDb', 'genre': 'Crime, Drama', 'poster': 'https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_.jpg'},
            {'title': 'The Dark Knight', 'year': '2008', 'imdbRating': '9.0', 'source': 'IMDb', 'genre': 'Action, Crime', 'poster': 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'}
        ]

    def get_sample_rt_data(self):
        return [
            {'title': 'The Shawshank Redemption', 'rotten_tomatoes_score': '91%', 'source': 'Rotten Tomatoes'},
            {'title': 'The Godfather', 'rotten_tomatoes_score': '98%', 'source': 'Rotten Tomatoes'},
            {'title': 'The Dark Knight', 'rotten_tomatoes_score': '94%', 'source': 'Rotten Tomatoes'}
        ]

    def get_sample_metacritic_data(self):
        return [
            {'title': 'The Shawshank Redemption', 'metacritic_score': '81', 'source': 'Metacritic'},
            {'title': 'The Godfather', 'metacritic_score': '100', 'source': 'Metacritic'},
            {'title': 'The Dark Knight', 'metacritic_score': '84', 'source': 'Metacritic'}
        ]

    def normalize_title(self, title):
        title = title.lower().strip()
        # Handle "The Godfather" vs "Godfather, The"
        if title.endswith(', the'):
            title = 'the ' + title[:-5]
        # Remove (2024), (re-release), etc.
        title = re.sub(r'\(.*?\)', '', title)
        # Remove non-alphanumeric
        title = re.sub(r'[^a-z0-9]', '', title)
        return title.strip()

    def combine_movie_data(self):
        print("Scraping IMDb (with details)...")
        imdb_movies = self.scrape_imdb_top_movies()
        
        print("Scraping Rotten Tomatoes...")
        rt_movies = self.scrape_rotten_tomatoes_movies()
        
        print("Scraping Metacritic...")
        metacritic_movies = self.scrape_metacritic_movies()
        
        combined_data = {}
        
        for movie in imdb_movies:
            title_key = self.normalize_title(movie['title'])
            combined_data[title_key] = movie
        
        for movie in rt_movies:
            title_key = self.normalize_title(movie['title'])
            if title_key in combined_data:
                combined_data[title_key].update({'rotten_tomatoes_score': movie.get('rotten_tomatoes_score', '0%')})
                if not combined_data[title_key].get('poster'):
                    combined_data[title_key]['poster'] = movie.get('poster')
            else:
                combined_data[title_key] = movie
        
        for movie in metacritic_movies:
            title_key = self.normalize_title(movie['title'])
            if title_key in combined_data:
                combined_data[title_key].update({'metacritic_score': movie.get('metacritic_score', '0')})
                if not combined_data[title_key].get('poster'):
                    combined_data[title_key]['poster'] = movie.get('poster')
            else:
                combined_data[title_key] = movie
        
        return list(combined_data.values())

    def save_to_json(self, data, filename='movie_data.json'):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")

    def save_to_csv(self, data, filename='movie_data.csv'):
        if not data:
            return
        
        all_keys = set()
        for movie in data:
            keys = {k for k, v in movie.items() if not isinstance(v, (list, dict))}
            all_keys.update(keys)
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=sorted(all_keys), extrasaction='ignore')
            writer.writeheader()
            writer.writerows(data)
        print(f"Data saved to {filename}")

def main():
    print("Starting movie data scraper...")
    scraper = MovieScraper()
    
    try:
        movie_data = scraper.combine_movie_data()
        print(f"\nFound {len(movie_data)} movies")
        scraper.save_to_json(movie_data, '../data/movie_data.json')
        scraper.save_to_csv(movie_data, '../data/movie_data.csv')
        print("\nScraping completed!")
    except Exception as e:
        print(f"Error during scraping: {e}")

if __name__ == "__main__":
    main()
