const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

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

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
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

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
