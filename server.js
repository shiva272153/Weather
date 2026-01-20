const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
        return res.status(400).json({ error: 'City name or coordinates are required' });
    }

    try {
        let url;
        if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        }
        const response = await axios.get(url);
        const data = response.data;
        res.json(data);

        // Log to CSV
        const timestamp = new Date().toISOString();
        const searchType = city ? 'City' : 'Coordinates';
        const inputValue = city || `${lat}, ${lon}`;
        const resolvedCity = data.name;
        const country = data.sys.country;
        const temp = data.main.temp;

        const csvLine = `"${timestamp}","${searchType}","${inputValue}","${resolvedCity}","${country}","${lat || data.coord.lat}","${lon || data.coord.lon}","${temp}"\n`;
        const csvPath = path.join(__dirname, 'user_locations.csv');

        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, 'Timestamp,SearchType,InputValue,ResolvedCity,Country,Latitude,Longitude,Temp\n');
        }

        fs.appendFile(csvPath, csvLine, (err) => {
            if (err) console.error('Error writing to CSV:', err);
        });
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({ error: error.response.data.message });
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ error: 'No response received from weather service' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Error fetching weather data' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
