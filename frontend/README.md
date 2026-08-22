# 🎬 MovieHub — Full-Stack Cinematic Movie Rating & Discovery Platform

![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite 5](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java 17+](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **MovieHub** is a production-grade, full-stack movie rating, review, and discovery platform built with a **React 18 + Vite** client and a **Java 17 + Spring Boot** RESTful backend. It features a cinematic dark mode design system, 300ms debounced search, animated shimmer skeleton loaders, location-aware theater discovery, Spring Security JWT authentication, and relational database persistence.

---

## ✨ Feature Highlights

### 🎨 Frontend Layer
- 🌙 **Cinematic Dark Theme**: Custom CSS variable design tokens (`#0b0f19` base, `#1f2937` surface) featuring glowing amber rating badges (`#f59e0b`) and glassmorphic header/modal backdrops (`backdrop-filter: blur(16px)`).
- ⚡ **300ms Debounced Search**: High-performance `useDebounce` hook delays search query execution by 300ms to reduce unneeded backend traffic.
- 💀 **Shimmer Skeleton Loaders**: Animated loading card placeholders (`SkeletonCard.jsx`) replace raw text spinners for fluid, layout-shift-free rendering.
- 📍 **Location-Aware Theater Finder**: Reverse geocoding and OpenStreetMap/Overpass integration for discovering nearby cinemas with interactive distance indicators and Google Maps directions.
- 📱 **Fluid Responsive Grid**: Mobile-first CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`) ensuring 100% responsiveness across screens from 375px to 4K.

### ⚙️ Backend Layer
- 🔐 **Spring Security & JWT**: Stateless token-based authentication (`JwtService`) securing user favorites, watchlists, profile management, and review submissions.
- 🗄️ **Spring Data JPA & Hibernate**: Relational persistence mapping using Spring Data JPA repositories with PostgreSQL or zero-config H2 database fallback support.
- 🌐 **RESTful Web Services**: Clean HTTP REST endpoints handling movie catalog queries, pagination, multi-criteria filtering, user accounts, and reviews.
- 🔒 **Centralized CORS Policies**: Pre-configured cross-origin resource sharing headers enabling seamless communication with the React frontend client.

---

## 🏗️ Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                       React 18 + Vite Frontend                        |
|                       (http://localhost:5173)                         |
+-----------------------------------+-----------------------------------+
                                    |
                                    | REST / JSON (HTTP API)
                                    v
+-----------------------------------------------------------------------+
|                      Spring Boot REST API Backend                     |
|                       (http://localhost:8080)                         |
|   [Spring Security + JWT] [Spring Data JPA] [Jackson JSON Engine]    |
+-----------------------------------+-----------------------------------+
                                    |
                                    | JDBC / Hibernate ORM
                                    v
+-----------------------------------------------------------------------+
|                      Relational Database Layer                        |
|                  (H2 In-Memory / PostgreSQL Database)                 |
+-----------------------------------------------------------------------+
```

### Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite | Component-based UI library & fast development server |
| **Styling** | Custom CSS Variables / Tokens | Cinematic dark mode tokens, CSS Grid, Glassmorphism FX |
| **Backend API** | Java 17+, Spring Boot 3.x | Enterprise REST web service framework |
| **Security** | Spring Security, JJWT (0.12.x) | Stateless JWT authentication & authorization |
| **Database** | PostgreSQL / H2 Database | Relational database persistence & dev fallback |
| **ORM** | Spring Data JPA / Hibernate | Object-Relational Mapping & repository abstraction |

---

## 📁 Repository Structure

```
Movie-Hub/
├── backend/
│   └── moviehub-backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/moviehub/
│       │   │   │   ├── config/          # Security & CORS configuration
│       │   │   │   ├── controller/      # REST API Controllers (Movie, Auth, Review)
│       │   │   │   ├── model/           # JPA Entities (Movie, User, Review)
│       │   │   │   ├── repository/     # Spring Data JPA Repositories
│       │   │   │   ├── security/       # JwtService & Auth Filters
│       │   │   │   └── service/        # Business Logic & Seeders
│       │   │   └── resources/
│       │   │       ├── application.properties # Server & DB Configuration
│       │   │       └── movies_integrated.json # Initial Movie Dataset
│       ├── pom.xml                     # Maven Dependencies Manifest
│       └── mvnw.cmd                    # Maven Wrapper Executable
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── config.js              # REST API Base URL Endpoint Config
│   │   ├── components/                # React Components
│   │   │   ├── ErrorBoundary.jsx      # Top-Level React Error Boundary
│   │   │   ├── Header.jsx             # Glassmorphic Sticky Header
│   │   │   ├── MovieCard.jsx          # Movie Card Component
│   │   │   ├── MovieModal.jsx         # Movie Details & Ratings Breakdown Modal
│   │   │   ├── MovieSection.jsx       # Grid Catalog & Pagination
│   │   │   ├── NearbyTheaters.jsx     # Geolocation Cinema Finder
│   │   │   ├── Reviews.jsx            # User Reviews CRUD
│   │   │   └── SkeletonCard.jsx       # Animated Shimmer Loading Placeholder
│   │   ├── hooks/
│   │   │   └── useDebounce.js         # Custom 300ms Debounce Hook
│   │   ├── App.css                    # Streamlined DRY Component Stylesheet
│   │   ├── index.css                  # Global CSS Variables & Design Tokens
│   │   ├── App.jsx                    # Application Container
│   │   └── main.jsx                   # Entry Point Wrapped in ErrorBoundary
│   ├── package.json                   # Node Dependencies & Scripts
│   └── vite.config.js                 # Vite Bundler Settings
└── README.md                          # Full-Stack Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **JDK**: Java `17` or higher
- **Maven**: (Included via `mvnw` / `mvnw.cmd` wrapper)

---

### 1. Backend Setup (Spring Boot)

1. **Navigate to the backend directory:**
   ```bash
   cd backend/moviehub-backend
   ```

2. **Database Configuration** (`src/main/resources/application.properties`):
   The backend includes a zero-config in-memory H2 database fallback out of the box. To connect your local PostgreSQL database, set the following environment variables or update `application.properties`:
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
   The backend API will start on **`http://localhost:8080`** and auto-seed 250 top movies.

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

## 🔌 API Reference Table

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | ❌ Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ Public |
| `GET` | `/api/movies` | Fetch paginated movies with optional `search` & `genre` | ❌ Public |
| `GET` | `/api/movies/{id}` | Get detailed movie metadata & scores | ❌ Public |
| `GET` | `/api/reviews/movie/{id}` | Get user reviews for a specific movie | ❌ Public |
| `POST` | `/api/reviews` | Submit a new review & rating (1 to 5 stars) | 🔒 JWT Bearer |
| `PUT` | `/api/reviews/{id}` | Edit an existing user review | 🔒 JWT Bearer |
| `DELETE` | `/api/reviews/{id}` | Delete a user review | 🔒 JWT Bearer |
| `GET` | `/api/favorites` | List authenticated user's favorite movies | 🔒 JWT Bearer |
| `POST` | `/api/favorites/{movieId}` | Add a movie to favorites | 🔒 JWT Bearer |
| `DELETE` | `/api/favorites/{movieId}` | Remove a movie from favorites | 🔒 JWT Bearer |
| `GET` | `/api/theaters` | Discover nearby cinemas by `lat` & `lon` coordinates | ❌ Public |

---

## 🛡️ Fault Tolerance & Defensive Features

- **Backend Offline Resilience**: If the API server is unreachable (`ERR_CONNECTION_REFUSED`), the frontend presents interactive error fallback cards with single-click **"Retry"** options.
- **Empty Query Fallbacks**: Searching for titles or selecting genre filters with no matching records renders an empty state with a single-click **"Clear Filters"** button.
- **React Error Boundary**: Top-level rendering exceptions are caught by `ErrorBoundary.jsx` to prevent full white-screen crashes and provide an immediate application reload prompt.

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
