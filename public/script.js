const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const forecastContainer = document.getElementById('forecast-container');
const forecastScroll = document.getElementById('forecast-scroll');

const tempEl = document.getElementById('temp');
const descEl = document.getElementById('description');
const humidEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const cityEl = document.getElementById('city-name');
const iconEl = document.getElementById('icon');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeather(null, latitude, longitude);
            },
            (error) => {
                showError('Unable to retrieve your location. Please ensure location services are enabled.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city, lat = null, lon = null) {
    try {
        // Reset UI
        errorMessage.style.display = 'none';
        weatherCard.style.display = 'none';

        let url = '/api/weather';
        if (city) {
            url += `?city=${encodeURIComponent(city)}`;
        } else if (lat && lon) {
            url += `?lat=${lat}&lon=${lon}`;
        } else {
            return;
        }

        // Fetch current weather
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
            // Fetch forecast
            getForecast(city, lat, lon);
        } else {
            showError(data.error || 'Weather data not found');
        }
    } catch (error) {
        showError('Something went wrong. Please try again.');
        console.error(error);
    }
}

function displayWeather(data) {
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    descEl.textContent = data.weather[0].description;
    humidEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} km/h`;
    cityEl.textContent = `${data.name}, ${data.sys.country}`;

    const iconCode = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherCard.style.display = 'block';
}

async function getForecast(city, lat, lon) {
    try {
        let url = '/api/forecast';
        if (city) {
            url += `?city=${encodeURIComponent(city)}`;
        } else if (lat && lon) {
            url += `?lat=${lat}&lon=${lon}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            displayForecast(data);
        } else {
            console.error('Forecast data not found');
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

function displayForecast(data) {
    forecastScroll.innerHTML = '';
    // Get the next 8 items (approx 24 hours)
    const list = data.list.slice(0, 8);

    list.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const iconCode = item.weather[0].icon;
        const temp = Math.round(item.main.temp);

        const itemEl = document.createElement('div');
        itemEl.classList.add('forecast-item');
        itemEl.innerHTML = `
            <span class="forecast-time">${time}</span>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon">
            <span class="forecast-temp">${temp}°C</span>
        `;
        forecastScroll.appendChild(itemEl);
    });

    forecastContainer.style.display = 'block';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    forecastContainer.style.display = 'none';
}
