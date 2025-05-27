# 🌍 World Explorer - Country & City Info Visualizer

A comprehensive, interactive web application that combines real-world data with beautiful UI to create an educational and travel-focused experience. Built with vanilla HTML, CSS, and JavaScript, featuring real APIs and dynamic data visualization.

![World Explorer Preview](https://via.placeholder.com/800x400/3b82f6/ffffff?text=World+Explorer+Preview)

## ✨ Features

### 🔍 **Smart Country Search**
- Real-time search with autocomplete suggestions
- Search by country name or capital city
- Instant results with country flags and basic info
- Clear and intuitive search interface

### 🗺️ **Detailed Country Information**
- Comprehensive country profiles with:
  - Flag, name, capital, and region
  - Population, area, and population density
  - Currency and languages
  - Timezones and neighboring countries
  - Interactive map integration
- Clickable neighboring countries for easy navigation

### 🌦️ **Live Weather Data**
- Real-time weather conditions for capital cities
- Temperature, humidity, wind speed, and more
- Toggle between Celsius and Fahrenheit
- Beautiful weather icons and detailed forecasts
- Powered by OpenWeatherMap API

### 📊 **Country Comparison Tool**
- Side-by-side comparison of any two countries
- Compare population, area, density, languages, and more
- Visual comparison cards with detailed statistics
- Easy-to-use dropdown selectors

### 🧭 **Continent Explorer**
- Browse countries by continent
- Interactive continent cards
- Complete country listings for each region
- Quick navigation between continents and countries

### ❤️ **Favorites System**
- Save favorite countries for quick access
- Persistent storage using localStorage
- Easy add/remove functionality
- Dedicated favorites tab

### 🌓 **Dark/Light Theme**
- Beautiful dark and light themes
- Smooth transitions between themes
- Persistent theme preference
- Eye-friendly design for any time of day

### 📱 **Fully Responsive Design**
- Mobile-first approach
- Touch-friendly interface
- Collapsible navigation
- Optimized for all screen sizes

## 🛠️ Tech Stack

- **HTML5** - Semantic, accessible markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript** - ES6+ features, async/await, classes
- **REST Countries API** - Comprehensive country data
- **OpenWeatherMap API** - Real-time weather information
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Beautiful icons

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls
- (Optional) OpenWeatherMap API key for weather features

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd world-explorer
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or serve it using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Configure Weather API (Optional)**
   - Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
   - Open `script.js` and replace `YOUR_OPENWEATHER_API_KEY` with your actual API key
   - Weather features will work immediately after this change

### Usage

1. **Search for Countries**
   - Use the search bar to find countries by name or capital
   - Click on suggestions or search results to view details

2. **Explore Country Details**
   - View comprehensive information about any country
   - Check weather conditions in the capital
   - See the country's location on an interactive map
   - Add countries to your favorites

3. **Compare Countries**
   - Switch to the "Compare" tab
   - Select two countries from the dropdowns
   - View side-by-side statistics

4. **Browse by Continent**
   - Click on continent cards to explore regions
   - Browse all countries within a continent
   - Quick navigation back to detailed views

5. **Manage Favorites**
   - Add countries to favorites using the heart button
   - Access your favorites in the dedicated tab
   - Remove favorites as needed

## 🎨 Customization

### Themes
The application supports easy theme customization through CSS custom properties:

```css
:root {
    --primary-color: #3b82f6;    /* Main brand color */
    --accent-color: #f59e0b;     /* Accent highlights */
    --success-color: #10b981;    /* Success states */
    --danger-color: #ef4444;     /* Error states */
}
```

### Adding New Features
The modular JavaScript architecture makes it easy to extend:

```javascript
class WorldExplorer {
    // Add new methods here
    async newFeature() {
        // Implementation
    }
}
```

## 📡 API Integration

### REST Countries API
- **Endpoint**: `https://restcountries.com/v3.1/all`
- **Features**: Country data, flags, demographics, geography
- **Rate Limit**: No authentication required
- **Documentation**: [REST Countries](https://restcountries.com/)

### OpenWeatherMap API
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Features**: Current weather, forecasts, weather icons
- **Rate Limit**: 1000 calls/day (free tier)
- **Documentation**: [OpenWeatherMap](https://openweathermap.org/api)

### Leaflet Maps
- **Service**: OpenStreetMap tiles
- **Features**: Interactive maps, markers, popups
- **Rate Limit**: Fair use policy
- **Documentation**: [Leaflet](https://leafletjs.com/)

## 🌟 Advanced Features

### Performance Optimizations
- Lazy loading of country data
- Efficient search algorithms
- Minimal API calls
- Optimized image loading

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help others understand the code

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [REST Countries](https://restcountries.com/) for comprehensive country data
- [OpenWeatherMap](https://openweathermap.org/) for weather API
- [Leaflet](https://leafletjs.com/) for mapping functionality
- [Font Awesome](https://fontawesome.com/) for beautiful icons
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles

## 📞 Support

If you have questions or need help:
- Check the documentation above
- Open an issue on GitHub
- Review the code comments for implementation details

---

**Built with ❤️ for geography enthusiasts and travelers worldwide!**
