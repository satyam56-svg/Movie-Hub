import requests
from bs4 import BeautifulSoup
import json
import time
import random
from urllib.parse import urljoin, quote
import csv

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

    def get_page(self, url, delay=2):
        time.sleep(delay + random.uniform(0.5, 1.5))
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
                    for item in data['itemListElement'][:15]:
                        movie_info = item.get('item', {})
                        import re
                        full_title = movie_info.get('name', 'Unknown')
                        year = movie_info.get('datePublished', movie_info.get('releaseDate', 'Unknown'))
                        
                        if year != 'Unknown':
                            year = year.split('-')[0]
                        
                        title = full_title
                        year_match = re.search(r'(\d{4})', full_title)
                        if year_match:
                            if year == 'Unknown' or len(year) != 4:
                                year = year_match.group(1)
                            title = full_title.replace(f"({year})", "").replace(year, "").strip(" ( )")
                        
                        rating = movie_info.get('aggregateRating', {}).get('ratingValue', '0.0')
                        poster = movie_info.get('image', '')
                        
                        if poster and '_V1_' in poster:
                            poster = re.sub(r'._V1_.*?.jpg', '._V1_.jpg', poster)
                            
                        movie_url = movie_info.get('url', '')
                        if movie_url:
                            movie_url = urljoin("https://www.imdb.com", movie_url)
                        
                        details = {}
                        if movie_url:
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
            
            for item in movie_items[:15]:
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
            
            details['actors'] = []
            actor_containers = soup.select('div[data-testid="title-cast-item"]')
            for container in actor_containers[:5]:
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

    def scrape_rotten_tomatoes_movies(self):
        url = "https://www.rottentomatoes.com/browse/movies_at_home/sort:popular"
        html = self.get_page(url)
        
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        movies = []

        try:
            grid_items = soup.select('tile-poster-default')
            if not grid_items:
                grid_items = soup.select('div.discovery-media-card')
            
            for item in grid_items[:15]:
                try:
                    title_element = item.select_one('span[data-qa="discovery-media-card-title"]')
                    if not title_element:
                        title_element = item.select_one('.p--small')
                    title = title_element.text.strip() if title_element else "Unknown"
                    
                    score_element = item.select_one('rt-text[slot="criticsScore"]')
                    if not score_element:
                        score_element = item.select_one('span.tomatometer')
                    score = score_element.text.strip() if score_element else "0%"
                    
                    img_element = item.select_one('rt-img')
                    poster = img_element['src'] if img_element and 'src' in img_element.attrs else ""
                    if not poster:
                        img_element = item.select_one('img')
                        poster = img_element['src'] if img_element and 'src' in img_element.attrs else ""

                    movies.append({
                        'title': title,
                        'rotten_tomatoes_score': score,
                        'source': 'Rotten Tomatoes',
                        'poster': poster
                    })
                except Exception as e:
                    print(f"Error parsing RT movie: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping Rotten Tomatoes: {e}")
            movies = self.get_sample_rt_data()

        return movies

    def scrape_metacritic_movies(self):
        url = "https://www.metacritic.com/browse/movies/score/metascore/all"
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
                    for item in data['itemListElement'][:15]:
                        movie_info = item.get('item', {})
                        title = movie_info.get('name', 'Unknown')
                        score = movie_info.get('aggregateRating', {}).get('ratingValue', '0')
                        poster = movie_info.get('image', '')
                        if poster and '_V1_' in poster:
                            import re
                            poster = re.sub(r'._V1_.*?.jpg', '._V1_.jpg', poster)
                            
                        movies.append({
                            'title': title,
                            'metacritic_score': str(score),
                            'source': 'Metacritic',
                            'poster': poster
                        })
                    return movies

            movie_cards = soup.select('.c-finderProductCard')
            if not movie_cards:
                movie_cards = soup.select('tr.c-finderProductRow')
            
            for card in movie_cards[:15]:
                try:
                    title_element = card.select_one('.c-finderProductCard_title span:nth-child(2)')
                    if not title_element:
                        title_element = card.select_one('h3.c-finderProductCard_title')
                    title = title_element.text.strip() if title_element else "Unknown"
                    
                    score_element = card.select_one('.c-siteReviewScore span')
                    if not score_element:
                        score_element = card.select_one('div.c-finderProductCard_score')
                    score = score_element.text.strip() if score_element else "0"
                    
                    img_element = card.select_one('img')
                    poster = img_element['src'] if img_element and 'src' in img_element.attrs else ""

                    movies.append({
                        'title': title,
                        'metacritic_score': score,
                        'source': 'Metacritic',
                        'poster': poster
                    })
                except Exception as e:
                    print(f"Error parsing Metacritic movie: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping Metacritic: {e}")
            movies = self.get_sample_metacritic_data()

        return movies

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

    def combine_movie_data(self):
        print("Scraping IMDb (with details)...")
        imdb_movies = self.scrape_imdb_top_movies()
        
        print("Scraping Rotten Tomatoes...")
        rt_movies = self.scrape_rotten_tomatoes_movies()
        
        print("Scraping Metacritic...")
        metacritic_movies = self.scrape_metacritic_movies()
        
        combined_data = {}
        
        for movie in imdb_movies:
            title = movie['title'].lower()
            combined_data[title] = movie
        
        for movie in rt_movies:
            title = movie['title'].lower()
            if title in combined_data:
                combined_data[title].update({'rotten_tomatoes_score': movie.get('rotten_tomatoes_score', '0%')})
                if not combined_data[title].get('poster'):
                    combined_data[title]['poster'] = movie.get('poster')
            else:
                combined_data[title] = movie
        
        for movie in metacritic_movies:
            title = movie['title'].lower()
            if title in combined_data:
                combined_data[title].update({'metacritic_score': movie.get('metacritic_score', '0')})
                if not combined_data[title].get('poster'):
                    combined_data[title]['poster'] = movie.get('poster')
            else:
                combined_data[title] = movie
        
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
        scraper.save_to_json(movie_data)
        scraper.save_to_csv(movie_data)
        print("\nScraping completed!")
    except Exception as e:
        print(f"Error during scraping: {e}")

if __name__ == "__main__":
    main()
