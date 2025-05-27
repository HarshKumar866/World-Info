// World Explorer - Main JavaScript File
class WorldExplorer {
    constructor() {
        this.countries = [];
        this.favorites = JSON.parse(localStorage.getItem('worldExplorerFavorites')) || [];
        this.currentTheme = localStorage.getItem('worldExplorerTheme') || 'light';
        this.weatherApiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
        this.currentTempUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
        this.map = null;

        console.log('WorldExplorer constructor called');
        this.init();
    }

    async init() {
        console.log('Initializing WorldExplorer...');
        try {
            this.setupEventListeners();
            console.log('Event listeners set up');

            this.applyTheme();
            console.log('Theme applied');

            await this.loadCountries();
            console.log('Countries loaded');

            this.populateCountrySelectors();
            console.log('Country selectors populated');

            this.loadFavorites();
            console.log('Favorites loaded');

            console.log('WorldExplorer initialization complete');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    setupEventListeners() {
        try {
            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            } else {
                console.warn('Theme toggle button not found');
            }

            // Navigation tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });

            // Search functionality
            const searchInput = document.getElementById('country-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
                searchInput.addEventListener('focus', () => this.showSuggestions());
            } else {
                console.warn('Search input not found');
            }

            const clearBtn = document.getElementById('clear-search');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearSearch());
            } else {
                console.warn('Clear search button not found');
            }

            // Compare functionality
            const country1Select = document.getElementById('country1-select');
            const country2Select = document.getElementById('country2-select');
            if (country1Select) {
                country1Select.addEventListener('change', () => this.handleCompare());
            }
            if (country2Select) {
                country2Select.addEventListener('change', () => this.handleCompare());
            }

            // Continent cards
            document.querySelectorAll('.continent-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const continent = e.currentTarget.dataset.continent;
                    this.showContinentCountries(continent);
                });
            });

            // Modal close functionality
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
            });

            // Click outside modal to close
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.closeModal(modal);
                });
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideSuggestions();
                }
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    async loadCountries() {
        try {
            this.showLoading();
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,area,flags,region,subregion,languages,currencies,timezones,borders,latlng,cca3');
            this.countries = await response.json();
            this.countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            this.hideLoading();
        } catch (error) {
            console.error('Error loading countries:', error);
            this.hideLoading();
            this.showError('Failed to load countries data. Please check your internet connection.');
        }
    }

    populateCountrySelectors() {
        const selectors = ['country1-select', 'country2-select'];
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            select.innerHTML = '<option value="">Select a country...</option>';

            this.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.cca3;
                option.textContent = country.name.common;
                select.appendChild(option);
            });
        });
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            this.clearSearchResults();
            return;
        }

        const matches = this.countries.filter(country =>
            country.name.common.toLowerCase().includes(query.toLowerCase()) ||
            (country.capital && country.capital[0] && country.capital[0].toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 8);

        this.showSearchSuggestions(matches);
        this.showSearchResults(matches);
    }

    showSearchSuggestions(countries) {
        const suggestions = document.getElementById('search-suggestions');
        suggestions.innerHTML = '';

        if (countries.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        countries.forEach(country => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <img src="${country.flags.svg}" alt="${country.name.common} flag" class="suggestion-flag">
                <div>
                    <strong>${country.name.common}</strong>
                    ${country.capital ? `<br><small>${country.capital[0]}</small>` : ''}
                </div>
            `;
            item.addEventListener('click', () => {
                this.selectCountry(country);
                this.hideSuggestions();
            });
            suggestions.appendChild(item);
        });

        suggestions.style.display = 'block';
    }

    showSearchResults(countries) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        if (countries.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center">No countries found matching your search.</p>';
            return;
        }

        countries.forEach(country => {
            const card = this.createCountryCard(country);
            resultsContainer.appendChild(card);
        });
    }

    createCountryCard(country) {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag" class="country-flag">
            <h3 class="country-name">${country.name.common}</h3>
            <p class="country-capital">Capital: ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p class="country-population">Population: ${this.formatNumber(country.population)}</p>
        `;

        card.addEventListener('click', () => this.selectCountry(country));
        return card;
    }

    selectCountry(country) {
        document.getElementById('country-search').value = country.name.common;
        this.showCountryDetails(country);
        this.clearSearchResults();
    }

    showCountryDetails(country) {
        const detailsContainer = document.getElementById('country-details');
        const isFavorite = this.favorites.some(fav => fav.cca3 === country.cca3);

        detailsContainer.innerHTML = `
            <div class="country-header">
                <img src="${country.flags.svg}" alt="${country.name.common} flag" class="country-flag-large">
                <div class="country-title">
                    <h2>${country.name.common}</h2>
                    <p class="country-subtitle">${country.capital ? country.capital[0] : 'No capital'} • ${country.region}</p>
                </div>
                <div class="country-actions">
                    <button class="action-btn favorite ${isFavorite ? 'active' : ''}" data-country='${JSON.stringify(country)}'>
                        <i class="fas fa-heart"></i>
                        ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button class="action-btn weather" data-capital="${country.capital ? country.capital[0] : ''}">
                        <i class="fas fa-cloud-sun"></i>
                        Weather
                    </button>
                    <button class="action-btn map" data-latlng="${country.latlng ? country.latlng.join(',') : ''}">
                        <i class="fas fa-map-marker-alt"></i>
                        Show on Map
                    </button>
                </div>
            </div>

            <div class="country-info">
                <div class="info-card">
                    <h4><i class="fas fa-users"></i> Demographics</h4>
                    <div class="info-value">Population: ${this.formatNumber(country.population)}</div>
                    <div class="info-value">Area: ${this.formatNumber(country.area)} km²</div>
                    <div class="info-value">Density: ${this.formatNumber(country.population / country.area)} people/km²</div>
                </div>

                <div class="info-card">
                    <h4><i class="fas fa-globe"></i> Geography</h4>
                    <div class="info-value">Region: ${country.region}</div>
                    <div class="info-value">Subregion: ${country.subregion || 'N/A'}</div>
                    <div class="info-value">Coordinates: ${country.latlng ? country.latlng.join(', ') : 'N/A'}</div>
                </div>

                <div class="info-card">
                    <h4><i class="fas fa-coins"></i> Economy</h4>
                    ${this.formatCurrencies(country.currencies)}
                </div>

                <div class="info-card">
                    <h4><i class="fas fa-language"></i> Languages</h4>
                    ${this.formatLanguages(country.languages)}
                </div>

                <div class="info-card">
                    <h4><i class="fas fa-clock"></i> Timezones</h4>
                    ${this.formatTimezones(country.timezones)}
                </div>

                ${country.borders && country.borders.length > 0 ? `
                <div class="info-card">
                    <h4><i class="fas fa-map"></i> Neighboring Countries</h4>
                    <div class="borders-list">
                        ${this.formatBorders(country.borders)}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Add event listeners for action buttons
        detailsContainer.querySelector('.favorite').addEventListener('click', (e) => {
            this.toggleFavorite(JSON.parse(e.target.dataset.country));
        });

        const weatherBtn = detailsContainer.querySelector('.weather');
        if (weatherBtn.dataset.capital) {
            weatherBtn.addEventListener('click', () => {
                this.showWeather(weatherBtn.dataset.capital, country.name.common);
            });
        } else {
            weatherBtn.disabled = true;
            weatherBtn.style.opacity = '0.5';
        }

        const mapBtn = detailsContainer.querySelector('.map');
        if (mapBtn.dataset.latlng) {
            mapBtn.addEventListener('click', () => {
                const [lat, lng] = mapBtn.dataset.latlng.split(',').map(Number);
                this.showMap(lat, lng, country.name.common);
            });
        } else {
            mapBtn.disabled = true;
            mapBtn.style.opacity = '0.5';
        }

        detailsContainer.classList.remove('hidden');
    }

    formatNumber(num) {
        if (!num) return 'N/A';
        return new Intl.NumberFormat().format(num);
    }

    formatCurrencies(currencies) {
        if (!currencies) return '<div class="info-value">N/A</div>';

        return Object.values(currencies).map(currency =>
            `<div class="info-value">${currency.name} (${currency.symbol || 'No symbol'})</div>`
        ).join('');
    }

    formatLanguages(languages) {
        if (!languages) return '<div class="info-value">N/A</div>';

        return Object.values(languages).map(language =>
            `<div class="info-value">${language}</div>`
        ).join('');
    }

    formatTimezones(timezones) {
        if (!timezones) return '<div class="info-value">N/A</div>';

        return timezones.map(timezone =>
            `<div class="info-value">${timezone}</div>`
        ).join('');
    }

    formatBorders(borders) {
        return borders.map(border => {
            const borderCountry = this.countries.find(c => c.cca3 === border);
            if (borderCountry) {
                return `<span class="border-country" data-country='${JSON.stringify(borderCountry)}'>${borderCountry.name.common}</span>`;
            }
            return border;
        }).join(', ');
    }

    clearSearch() {
        document.getElementById('country-search').value = '';
        this.hideSuggestions();
        this.clearSearchResults();
        document.getElementById('country-details').classList.add('hidden');
    }

    clearSearchResults() {
        document.getElementById('search-results').innerHTML = '';
    }

    hideSuggestions() {
        document.getElementById('search-suggestions').style.display = 'none';
    }

    showSuggestions() {
        const query = document.getElementById('country-search').value;
        if (query.length >= 2) {
            this.handleSearch(query);
        }
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('worldExplorerTheme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Tab Management
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Clear search when switching tabs
        if (tabName !== 'search') {
            this.clearSearch();
        }
    }

    // Utility functions
    showLoading() {
        document.getElementById('loading-spinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-spinner').classList.add('hidden');
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        alert(message);
    }

    closeModal(modal) {
        modal.classList.add('hidden');
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    // Compare Mode
    handleCompare() {
        const country1Code = document.getElementById('country1-select').value;
        const country2Code = document.getElementById('country2-select').value;

        if (!country1Code || !country2Code) {
            document.getElementById('comparison-results').innerHTML = '';
            return;
        }

        const country1 = this.countries.find(c => c.cca3 === country1Code);
        const country2 = this.countries.find(c => c.cca3 === country2Code);

        if (country1 && country2) {
            this.showComparison(country1, country2);
        }
    }

    showComparison(country1, country2) {
        const comparisonContainer = document.getElementById('comparison-results');

        comparisonContainer.innerHTML = `
            <div class="comparison-card">
                ${this.createComparisonCard(country1)}
            </div>
            <div class="comparison-card">
                ${this.createComparisonCard(country2)}
            </div>
        `;
    }

    createComparisonCard(country) {
        return `
            <div class="comparison-header">
                <img src="${country.flags.svg}" alt="${country.name.common} flag" class="comparison-flag">
                <div class="comparison-title">
                    <h3>${country.name.common}</h3>
                    <p>${country.capital ? country.capital[0] : 'No capital'}</p>
                </div>
            </div>
            <div class="comparison-stats">
                <div class="stat-row">
                    <span class="stat-label">Population</span>
                    <span class="stat-value">${this.formatNumber(country.population)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Area</span>
                    <span class="stat-value">${this.formatNumber(country.area)} km²</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Density</span>
                    <span class="stat-value">${this.formatNumber(country.population / country.area)} people/km²</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Region</span>
                    <span class="stat-value">${country.region}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Subregion</span>
                    <span class="stat-value">${country.subregion || 'N/A'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Languages</span>
                    <span class="stat-value">${country.languages ? Object.values(country.languages).length : 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Timezones</span>
                    <span class="stat-value">${country.timezones ? country.timezones.length : 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Borders</span>
                    <span class="stat-value">${country.borders ? country.borders.length : 0}</span>
                </div>
            </div>
        `;
    }

    // Continent Browser
    showContinentCountries(continent) {
        const continentCountries = this.countries.filter(country =>
            country.region === continent ||
            (continent === 'North America' && country.region === 'Americas' && country.subregion && country.subregion.includes('North')) ||
            (continent === 'South America' && country.region === 'Americas' && country.subregion && country.subregion.includes('South'))
        );

        const container = document.getElementById('continent-countries');
        container.innerHTML = `
            <h3><i class="fas fa-map"></i> Countries in ${continent} (${continentCountries.length})</h3>
            <div class="countries-grid">
                ${continentCountries.map(country => `
                    <div class="continent-country-card" data-country='${JSON.stringify(country)}'>
                        <img src="${country.flags.svg}" alt="${country.name.common} flag" class="continent-country-flag">
                        <div class="continent-country-info">
                            <h4>${country.name.common}</h4>
                            <p>${country.capital ? country.capital[0] : 'No capital'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click listeners to country cards
        container.querySelectorAll('.continent-country-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const country = JSON.parse(e.currentTarget.dataset.country);
                this.switchTab('search');
                this.selectCountry(country);
            });
        });
    }

    // Favorites Management
    toggleFavorite(country) {
        const existingIndex = this.favorites.findIndex(fav => fav.cca3 === country.cca3);

        if (existingIndex > -1) {
            this.favorites.splice(existingIndex, 1);
        } else {
            this.favorites.push(country);
        }

        localStorage.setItem('worldExplorerFavorites', JSON.stringify(this.favorites));
        this.loadFavorites();

        // Update the button in country details if visible
        const favoriteBtn = document.querySelector('.country-details .favorite');
        if (favoriteBtn) {
            const isNowFavorite = this.favorites.some(fav => fav.cca3 === country.cca3);
            favoriteBtn.classList.toggle('active', isNowFavorite);
            favoriteBtn.innerHTML = `
                <i class="fas fa-heart"></i>
                ${isNowFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            `;
        }
    }

    loadFavorites() {
        const favoritesContainer = document.getElementById('favorites-list');

        if (this.favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken"></i>
                    <p>No favorites yet. Start exploring and add countries to your favorites!</p>
                </div>
            `;
            return;
        }

        favoritesContainer.innerHTML = this.favorites.map(country => {
            const card = this.createCountryCard(country);
            return card.outerHTML;
        }).join('');

        // Add click listeners to favorite cards
        favoritesContainer.querySelectorAll('.country-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.switchTab('search');
                this.selectCountry(this.favorites[index]);
            });
        });
    }

    // Weather Functionality
    async showWeather(city, countryName) {
        if (!this.weatherApiKey || this.weatherApiKey === 'YOUR_OPENWEATHER_API_KEY') {
            this.showWeatherError('Weather API key not configured. Please add your OpenWeatherMap API key.');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherApiKey}&units=${this.currentTempUnit}`
            );

            if (!response.ok) {
                throw new Error('Weather data not available');
            }

            const weatherData = await response.json();
            this.displayWeather(weatherData, countryName);
            this.hideLoading();
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.hideLoading();
            this.showWeatherError('Unable to fetch weather data for this location.');
        }
    }

    displayWeather(weatherData, countryName) {
        const modal = document.getElementById('weather-modal');
        const content = document.getElementById('weather-content');

        const tempUnit = this.currentTempUnit === 'metric' ? '°C' : '°F';
        const windUnit = this.currentTempUnit === 'metric' ? 'm/s' : 'mph';

        content.innerHTML = `
            <div class="weather-main">
                <div class="weather-temp-section">
                    <div>
                        <div class="weather-temp-large">${Math.round(weatherData.main.temp)}${tempUnit}</div>
                        <div class="weather-description">${weatherData.weather[0].description}</div>
                        <div style="color: var(--text-muted); margin-top: 0.5rem;">
                            ${weatherData.name}, ${countryName}
                        </div>
                    </div>
                </div>
                <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"
                     alt="Weather icon" class="weather-icon-large">
            </div>

            <div class="weather-details-grid">
                <div class="weather-detail-card">
                    <i class="fas fa-thermometer-half"></i>
                    <div class="label">Feels like</div>
                    <div class="value">${Math.round(weatherData.main.feels_like)}${tempUnit}</div>
                </div>
                <div class="weather-detail-card">
                    <i class="fas fa-tint"></i>
                    <div class="label">Humidity</div>
                    <div class="value">${weatherData.main.humidity}%</div>
                </div>
                <div class="weather-detail-card">
                    <i class="fas fa-wind"></i>
                    <div class="label">Wind Speed</div>
                    <div class="value">${weatherData.wind.speed} ${windUnit}</div>
                </div>
                <div class="weather-detail-card">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <div class="label">Pressure</div>
                    <div class="value">${weatherData.main.pressure} hPa</div>
                </div>
                <div class="weather-detail-card">
                    <i class="fas fa-eye"></i>
                    <div class="label">Visibility</div>
                    <div class="value">${weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</div>
                </div>
                <div class="weather-detail-card">
                    <i class="fas fa-cloud"></i>
                    <div class="label">Cloudiness</div>
                    <div class="value">${weatherData.clouds.all}%</div>
                </div>
            </div>

            <div class="temp-toggle">
                <button class="${this.currentTempUnit === 'metric' ? 'active' : ''}" data-unit="metric">°C</button>
                <button class="${this.currentTempUnit === 'imperial' ? 'active' : ''}" data-unit="imperial">°F</button>
            </div>
        `;

        // Add temperature unit toggle listeners
        content.querySelectorAll('.temp-toggle button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newUnit = e.target.dataset.unit;
                if (newUnit !== this.currentTempUnit) {
                    this.currentTempUnit = newUnit;
                    this.showWeather(weatherData.name, countryName);
                }
            });
        });

        modal.classList.remove('hidden');
    }

    showWeatherError(message) {
        const modal = document.getElementById('weather-modal');
        const content = document.getElementById('weather-content');

        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">${message}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
                    To enable weather data, sign up for a free API key at
                    <a href="https://openweathermap.org/api" target="_blank" style="color: var(--primary-color);">OpenWeatherMap</a>
                </p>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    // Map Functionality
    showMap(lat, lng, countryName) {
        const modal = document.getElementById('map-modal');
        const mapContainer = document.getElementById('map-container');

        // Clear any existing map
        mapContainer.innerHTML = '';

        // Initialize Leaflet map
        this.map = L.map('map-container').setView([lat, lng], 6);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add marker
        L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(`<strong>${countryName}</strong><br>Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();

        modal.classList.remove('hidden');

        // Invalidate size after modal is shown
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorldExplorer();
});
