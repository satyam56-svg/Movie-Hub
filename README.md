# 🎬 MovieHub — Full-Stack Cinematic Movie Discovery & Rating Platform

![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Spring Boot 4](https://img.shields.io/badge/Spring_Boot-4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java 17+](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Python 3](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **MovieHub** is a production-grade, full-stack movie rating, review, and discovery platform built with a **React 19 + Vite** client, a **Java 17 + Spring Boot 4** RESTful backend, and an automated multi-source **Python Data Scraping Pipeline**. It features a cinematic dark mode design system, 300ms debounced search, animated shimmer skeleton loaders, location-aware theater discovery, showtimes & streaming links, admin dashboards, Spring Security JWT authentication, and relational database persistence.

---

## ✨ Feature Highlights

### 🎨 Frontend Layer (React 19 + Vite)
- 🌙 **Cinematic Dark Theme**: Custom CSS design tokens (`#0b0f19` base, `#1f2937` surface) featuring glowing amber rating badges (`#f59e0b`) and glassmorphic backdrops (`backdrop-filter: blur(16px)`).
- ⚡ **300ms Debounced Search**: High-performance `useDebounce` custom hook delays search query execution by 300ms to reduce unnecessary backend network calls.
- 💀 **Shimmer Skeleton Loaders**: Fluid, layout-shift-free loading card placeholders (`SkeletonCard.jsx`).
- 📍 **Location-Aware Cinema Finder**: Reverse geocoding & OpenStreetMap/Overpass API integration for discovering nearby theaters with interactive distance indicators and direct Google Maps directions (`NearbyTheaters.jsx`).
- 🎟️ **Showtimes & Streaming Options**: Integrated theater showtimes scheduling (`Showtimes.jsx`) and streaming availability links (`WhereToWatch.jsx`).
- 👑 **Admin Management Portal**: Comprehensive admin dashboard for movie catalog administration, user moderation, and review management (`AdminDashboard.jsx`).
- 🔐 **User Accounts & Personalization**: Authentication modal workflows, custom watchlists (`Watchlist.jsx`), favorite collections (`Favorites.jsx`), user reviews (`MyReviews.jsx`), and profile management (`Profile.jsx`).

### ⚙️ Backend Layer (Java 17 + Spring Boot 4)
- 🔐 **Spring Security & JWT**: Stateless token-based authentication (`JwtService`) securing user watchlists, favorites, profile management, admin endpoints, and review submissions.
- 🗄️ **Spring Data JPA & Hibernate**: Relational database persistence mapping with PostgreSQL driver and zero-config H2 database in-memory fallback.
- 🌐 **RESTful Web Services**: Clean HTTP REST endpoints for movie catalog queries, pagination, multi-criteria filtering, user authentication, review CRUD, and cinema discoveries.
- 🛡️ **Defensive Error Handling & CORS**: Pre-configured cross-origin resource sharing policies enabling seamless API integration with the React client.

### 🕷️ Data Scraping & Pipeline Tier (Python 3)
- 🤖 **Automated Multi-Source Pipeline**: Automated extraction from IMDb, Rotten Tomatoes, and Metacritic (`pipeline.py`).
- 🌐 **Headless Browser & Dynamic Parsing**: Powered by `Playwright`, `BeautifulSoup4`, `lxml`, and `requests`.
- ✅ **Dataset Integrity Validator**: Built-in verification script (`validate_dataset.py`) for data validation before backend initialization.

---

## 🏗️ Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                       React 19 + Vite Frontend                        |
|                       (http://localhost:5173)                         |
+-----------------------------------+-----------------------------------+
                                    |
                                    | REST / JSON (HTTP API)
                                    v
+-----------------------------------------------------------------------+
|                      Spring Boot REST API Backend                     |
|                       (http://localhost:8080)                         |
|   [Spring Security + JWT] [Spring Data JPA] [Jackson JSON Engine]     |
+-----------------------------------+-----------------------------------+
                                    |
                                    | JDBC / Hibernate ORM
                                    v
+-----------------------------------------------------------------------+
|                      Relational Database Layer                        |
|                  (H2 In-Memory / PostgreSQL Database)                 |
+-----------------------------------------------------------------------+
                                    ^
                                    | Data Ingestion (movies_integrated.json)
+-----------------------------------------------------------------------+
|                   Python Multi-Source Data Pipeline                   |
|               (IMDb + Rotten Tomatoes + Metacritic Scrapers)          |
+-----------------------------------------------------------------------+
```

### Tech Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite 8 | Component-based UI library & ultra-fast dev server |
| **Styling** | Custom CSS3 Variables & Tokens | Cinematic dark mode, CSS Grid, Glassmorphism FX |
| **Backend API** | Java 17+, Spring Boot 4.x | Enterprise RESTful web service framework |
| **Security** | Spring Security, JJWT (0.12.x) | Stateless JWT authentication & authorization |
| **Database** | PostgreSQL / H2 Database | Relational database persistence & dev fallback |
| **ORM** | Spring Data JPA / Hibernate | Object-Relational Mapping & repository abstraction |
| **Data Scraping** | Python 3, Playwright, BS4, lxml | Multi-source scraping pipeline (IMDb, RT, Metacritic) |

---

## 📁 Repository Structure

```
Movie_rating/
├── backend/
│   └── moviehub-backend/               # Java 17 + Spring Boot 4 REST Backend Service
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/moviehub/
│       │   │   │   ├── config/          # Security, CORS & Web Configuration
│       │   │   │   ├── controller/      # API Controllers (Movie, Auth, Review, Theater, Admin, etc.)
│       │   │   │   ├── model/           # JPA Entities (Movie, User, Review)
│       │   │   │   ├── repository/      # Spring Data JPA Repositories
│       │   │   │   ├── security/        # JwtService & Auth Filters
│       │   │   │   └── service/         # Business Logic & Initial Data Seeders
│       │   │   └── resources/
│       │   │       ├── application.properties # Application & Database Configuration
│       │   │       └── movies_integrated.json # Initial Movie Catalog Dataset
│       ├── Dockerfile                  # Container Deployment Configuration
│       ├── pom.xml                     # Maven Dependencies Manifest
│       └── mvnw.cmd                    # Maven Wrapper Executable
├── frontend/                           # React 19 + Vite Web Application
│   ├── src/
│   │   ├── api/
│   │   │   └── config.js              # REST API Base URL Endpoint Config
│   │   ├── components/                # React Components
│   │   │   ├── ActorsSection.jsx      # Cast & Actor Overview
│   │   │   ├── AdminDashboard.jsx     # Catalog & User Moderation Dashboard
│   │   │   ├── ErrorBoundary.jsx      # Top-Level React Error Boundary
│   │   │   ├── Favorites.jsx          # User Favorite Movies Page
│   │   │   ├── GenresSection.jsx       # Genre Browsing & Filtering
│   │   │   ├── Header.jsx             # Glassmorphic Sticky Navigation Header
│   │   │   ├── Hero.jsx               # Featured Banner Display
│   │   │   ├── InCinemas.jsx          # Currently Playing Movies
│   │   │   ├── Login.jsx              # User Authentication Modal
│   │   │   ├── MovieCard.jsx          # Movie Card Component
│   │   │   ├── MovieModal.jsx         # Movie Details & Ratings Breakdown Modal
│   │   │   ├── MovieSection.jsx       # Grid Catalog & Pagination
│   │   │   ├── MyReviews.jsx          # User Submitted Reviews
│   │   │   ├── NearbyTheaters.jsx     # Geolocation Cinema Discovery
│   │   │   ├── Profile.jsx            # User Profile & Preferences
│   │   │   ├── Register.jsx           # User Registration Form
│   │   │   ├── Reviews.jsx            # Movie Community Reviews & Ratings CRUD
│   │   │   ├── Showtimes.jsx          # Cinema Showtimes Scheduler
│   │   │   ├── SkeletonCard.jsx       # Animated Shimmer Loading Placeholder
│   │   │   ├── Watchlist.jsx          # User Watchlist Page
│   │   │   └── WhereToWatch.jsx       # Streaming Availability Links
│   │   ├── hooks/
│   │   │   └── useDebounce.js         # Custom 300ms Search Debounce Hook
│   │   ├── App.css                    # Component Stylesheet
│   │   ├── index.css                  # Global CSS Variables & Design Tokens
│   │   ├── App.jsx                    # Core Application Container
│   │   └── main.jsx                   # Entry Point Wrapped in ErrorBoundary
│   ├── package.json                   # Node Dependencies & Build Scripts
│   └── vite.config.js                 # Vite Configuration
├── scraper/                            # Python Scraping Pipeline
│   ├── rt_scraper.py                  # Rotten Tomatoes Scraper
│   ├── metacritic_scraper.py          # Metacritic Ratings Scraper
│   ├── pipeline.py                    # Data Scraping & Enrichment Pipeline
│   ├── validate_dataset.py            # Dataset Integrity Verification Tool
│   └── requirements.txt               # Python Dependencies Manifest
├── data/                               # Raw & Processed Dataset Files
├── index.html                          # Web Gateway / Client Redirect
└── README.md                           # Full-Stack Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **JDK**: Java `17` or higher
- **Python**: `3.9+` (Required only if running data scraper)
- **Maven**: (Included via `mvnw` / `mvnw.cmd` wrapper)

---

### 1. Backend Setup (Spring Boot)

1. **Navigate to the backend directory:**
   ```bash
   cd backend/moviehub-backend
   ```

2. **Database Configuration** (`src/main/resources/application.properties`):
   The backend includes an in-memory H2 database fallback out of the box. To connect your PostgreSQL database, configure your environment variables or update `application.properties`:
   ```properties
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/moviehub
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your_password
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ```

3. **Start the backend server:**
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run

   # Linux / macOS
   ./mvnw spring-boot:run
   ```
   The backend REST API will start on **`http://localhost:8080`** and seed initial movie data.

---

### 2. Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration** (`.env`):
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend application will open on **`http://localhost:5173`**.

5. **Build for Production:**
   ```bash
   npm run build
   npm run preview
   ```

---

### 3. Data Scraper Pipeline Setup (Optional)

To refresh or update movie scores from IMDb, Rotten Tomatoes, and Metacritic:

1. **Navigate to the scraper directory:**
   ```bash
   cd scraper
   ```

2. **Install dependencies & browser engine:**
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

3. **Run the data pipeline & validation:**
   ```bash
   python pipeline.py            # Full scrape run
   python pipeline.py --limit 10 # Quick test run on 10 movies
   python validate_dataset.py    # Validate generated movies_integrated.json
   ```

---

## 🔌 Key REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | ❌ Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ Public |
| `GET` | `/api/movies` | Fetch paginated movies with `search` & `genre` filtering | ❌ Public |
| `GET` | `/api/movies/{id}` | Get detailed movie metadata & ratings | ❌ Public |
| `GET` | `/api/reviews/movie/{id}` | Get user reviews for a specific movie | ❌ Public |
| `POST` | `/api/reviews` | Submit a review & rating (1 to 5 stars) | 🔒 JWT Bearer |
| `PUT` | `/api/reviews/{id}` | Edit an existing user review | 🔒 JWT Bearer |
| `DELETE` | `/api/reviews/{id}` | Delete a user review | 🔒 JWT Bearer |
| `GET` | `/api/favorites` | List authenticated user's favorite movies | 🔒 JWT Bearer |
| `POST` | `/api/favorites/{movieId}` | Add a movie to user favorites | 🔒 JWT Bearer |
| `DELETE` | `/api/favorites/{movieId}` | Remove a movie from favorites | 🔒 JWT Bearer |
| `GET` | `/api/watchlist` | Get authenticated user's watchlist | 🔒 JWT Bearer |
| `POST` | `/api/watchlist/{movieId}` | Add movie to watchlist | 🔒 JWT Bearer |
| `GET` | `/api/theaters` | Discover nearby cinemas by `lat` & `lon` | ❌ Public |

---

## 🛡️ Fault Tolerance & Defensive Features

- **Backend Offline Resilience**: If the API server is unreachable, the frontend presents interactive error fallback cards with single-click **"Retry"** options.
- **Empty Query Fallbacks**: Searching for titles or selecting genre filters with no matching records renders an empty state with a single-click **"Clear Filters"** button.
- **React Error Boundary**: Top-level rendering exceptions are caught by `ErrorBoundary.jsx` to prevent white-screen crashes and provide an immediate reload prompt.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
