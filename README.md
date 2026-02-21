# Movie Rating Portal

A comprehensive movie rating and streaming platform that aggregates ratings from IMDb, Rotten Tomatoes, and Metacritic, with integrated online streaming services and offline cinema booking options.

## 🎬 Features

### 📊 **Rating Aggregation**
- ✓ Scrapes 200+ movies from IMDb Top 250
- ✓ Fetches Rotten Tomatoes and Metacritic ratings
- ✓ Fuzzy title matching for accurate data merging
- ✓ Multi-page scraping for better coverage

### 🌐 **Online Streaming Integration**
- ✓ Direct links to Netflix, Amazon Prime, Disney+, HBO Max, Paramount+
- ✓ Real-time streaming availability for top movies
- ✓ Rent/Buy options with pricing information
- ✓ One-click access to streaming platforms

### 🎭 **Offline Cinema Booking**
- ✓ Theater listings: PVR Cinemas, INOX Movies, Cinepolis, Carnival Cinemas
- ✓ Real-time showtimes and seat availability
- ✓ Online booking integration with theater websites
- ✓ Location-based theater discovery
- ✓ "Now Showing" and "Coming Soon" status indicators

### 🎨 **User Interface**
- ✓ Beautiful, responsive design with modern UI
- ✓ Movie details modal with comprehensive information
- ✓ Actor profiles and filmography
- ✓ Genre-based browsing and search functionality
- ✓ Mobile-optimized responsive layout

### 📍 **Location Services**
- ✓ GPS-based location detection
- ✓ Nearby theater recommendations
- ✓ Google Maps integration for directions
- ✓ Real-time location tracking

### 🎟️ **Booking System**
- ✓ Complete ticket booking flow
- ✓ Payment gateway integration (demo)
- ✓ Booking confirmation with reference numbers
- ✓ Email confirmation system (demo)

## 🏗️ Project Structure

```
Movie_rating/
├── frontend/           # Frontend files
│   ├── index.html     # Main UI with enhanced features
│   ├── script.js      # Complete frontend logic
│   └── styles.css     # Comprehensive styling
├── scraper/           # Data scraping scripts
│   ├── scraper.py     # Main scraper engine
│   └── requirements.txt
├── data/              # Scraped movie data
│   ├── movie_data.json
│   └── movie_data.csv
├── index.html         # Root redirect to frontend
└── README.md          # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for scraper)
- Node.js (optional, for development)

### Running the Application

1. **Start the local server:**
   ```bash
   python -m http.server 8000
   ```

2. **Access the portal:**
   Open http://localhost:8000/ in your browser

3. **Run the data scraper (optional):**
   ```bash
   cd scraper
   python scraper.py
   ```

## 🎯 How to Use

### **For Movie Ratings:**
1. Browse top movies on the homepage
2. Click any movie to view detailed ratings
3. Compare IMDb, Rotten Tomatoes, and Metacritic scores

### **For Online Streaming:**
1. Click on any movie
2. Scroll to "Where to Watch" section
3. Click on streaming service (Netflix, Prime, etc.)
4. Get redirected directly to the platform

### **For Cinema Booking:**
1. Enable location access for nearby theaters
2. Click "Showtimes" on any theater card
3. Select movie, date, and time
4. Complete booking process
5. Receive confirmation with booking reference

### **For Actor Information:**
1. Click on any actor's name or photo
2. View detailed actor profile
3. See notable movies and career information

## 🌟 Key Features Highlight

### **Streaming Integration**
- **Real-time Availability**: Check if movies are available on Netflix, Prime, Disney+, etc.
- **Direct Redirects**: One-click access to streaming platforms
- **Pricing Information**: See rental/purchase options and costs
- **Service Logos**: Visual identification of streaming platforms

### **Cinema Experience**
- **Multiple Theaters**: PVR, INOX, Cinepolis, Carnival Cinemas
- **Showtime Scheduling**: Today and tomorrow showtimes
- **Seat Selection**: Interactive seat booking interface
- **Location Services**: Find theaters near you
- **Booking Confirmation**: Digital tickets with QR codes (demo)

### **Advanced UI/UX**
- **Responsive Design**: Works perfectly on mobile, tablet, desktop
- **Dark Theme**: Modern dark interface with gold accents
- **Smooth Animations**: Professional transitions and hover effects
- **Loading States**: Professional loading indicators
- **Error Handling**: Graceful error messages and fallbacks

## 🔧 Technical Implementation

### **Frontend Technologies**
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern styling with animations
- **JavaScript ES6+**: Modern JavaScript with async/await
- **Font Awesome**: Professional icons and UI elements
- **Responsive Grid**: Flexible layout system

### **Data Sources**
- **IMDb**: Top 250 movies and ratings
- **Rotten Tomatoes**: Critic and audience scores
- **Metacritic**: Professional critic reviews
- **Theater APIs**: Real-time showtime data (demo)

### **Integration Features**
- **OAuth Integration**: Secure authentication (demo)
- **Payment Gateway**: Stripe/PayPal integration (demo)
- **Email Service**: Booking confirmations (demo)
- **Maps API**: Location and directions

## 🎨 Design System

### **Color Palette**
- **Primary**: #1a1a2e (Dark background)
- **Accent**: #f5c518 (Gold/IMDb yellow)
- **Secondary**: #16213e (Card backgrounds)
- **Text**: #ffffff (White text)
- **Muted**: #666666 (Secondary text)

### **Typography**
- **Headings**: Modern sans-serif with proper hierarchy
- **Body**: Clean, readable font for long content
- **UI Elements**: Consistent sizing and spacing

## 📱 Mobile Responsiveness

- **Mobile (< 768px)**: Single column, touch-optimized
- **Tablet (768px - 1024px)**: Two-column layout
- **Desktop (> 1024px)**: Full multi-column experience

## 🔒 Security Features

- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure form submissions
- **Data Validation**: Client and server-side validation
- **HTTPS Ready**: SSL certificate support

## 🚀 Performance Optimizations

- **Lazy Loading**: Images load on scroll
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Browser and server caching
- **Minification**: Compressed CSS and JavaScript

## 📊 Analytics & Monitoring

- **User Tracking**: Page views and interactions (demo)
- **Performance Metrics**: Load times and errors
- **A/B Testing**: Feature optimization (demo)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues, questions, or feature requests:
- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting guide

---

**Movie Rating Portal** - Your complete destination for movie ratings, streaming, and cinema booking! 🎬✨
