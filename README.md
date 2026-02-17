# MovieHub - My Movie Info Project

Hi! This is my project where I built a website that shows information about top-rated movies. It's like a mini-version of IMDb. 

The cool part is that it doesn't just show fake data—it actually goes to the internet, visits sites like IMDb, Rotten Tomatoes, and Metacritic, and "scrapes" (collects) the real information from there.

## What does it do?
- **Top Movies**: Shows you the best movies from 3 different famous websites.
- **Real Info**: You get real posters, movie plots, and even the cast (actors) list.
- **Search**: You can search for your favorite movie or actor.
- **Compare Ratings**: It shows you scores from different sites in one place so you can decide what to watch.
- **Looks Good**: I designed it to look clean and professional, inspired by IMDb's black-and-gold theme.

## How to use this project?

### Step 1: Get the data
First, you need to tell the Python script to go and get the movie information from the web.
1. Open your terminal/command prompt.
2. Install the needed tools (if you haven't): `pip install -r requirements.txt`
3. Run the scraper: `python scraper.py`
Wait for a minute or two, and you'll see a file called `movie_data.json` appear. That's your database!

### Step 2: Open the website
Now that you have the data, you can see it on the site.
1. Just open `index.html` in your browser.
2. (Optional but better) Run `python -m http.server 8000` and go to `http://localhost:8000` in your browser.

## What's in the folder?
- `index.html`: The structure of the website.
- `styles.css`: All the design and colors.
- `script.js`: The "brain" of the website that makes the searching and popups work.
- `scraper.py`: The Python script that fetches real data from the web.
- `requirements.txt`: A list of Python tools I used for scraping.

## Why I made this?
I wanted to learn two things:
1. How to grab data from websites using Python (Web Scraping).
2. How to show that data on a nice-looking website using HTML, CSS, and JavaScript.

**Note:** This is just a school/learning project. Since websites change all the time, the scraper might need updates occasionally if those sites change their look!
