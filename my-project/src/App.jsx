import { useState } from 'react'
import './App.css'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

function getWeatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return descriptions[code] || 'Unknown'
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    const trimmed = city.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      // Step 1: Geocode the city name
      const geoRes = await fetch(
        `${GEOCODING_URL}?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        setError(`City "${trimmed}" not found. Please try another name.`)
        setLoading(false)
        return
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      // Step 2: Fetch current weather
      const weatherRes = await fetch(
        `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      )
      const weatherData = await weatherRes.json()

      setWeather({
        city: name,
        country,
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
      })
    } catch {
      setError('Failed to fetch weather data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="header-icon">🌤️</span> Weather Dashboard
        </h1>
        <p className="subtitle">Search any city to get real-time weather conditions</p>
      </header>

      <form className="search-form" onSubmit={handleSearch} id="search-form">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="city-input"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            aria-label="City name"
          />
          <button type="submit" id="search-button" disabled={loading || !city.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="status-card loading" id="loading-message">
          <div className="spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}

      {error && (
        <div className="status-card error" id="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {weather && !loading && (
        <div className="weather-card" id="weather-card">
          <div className="weather-main">
            <div className="weather-emoji">
              {getWeatherEmoji(weather.weatherCode)}
            </div>
            <div className="weather-temp">
              <span className="temp-value">{Math.round(weather.temperature)}</span>
              <span className="temp-unit">°C</span>
            </div>
            <p className="weather-desc">
              {getWeatherDescription(weather.weatherCode)}
            </p>
            <h2 className="weather-city">
              {weather.city}, <span className="country">{weather.country}</span>
            </h2>
          </div>

          <div className="weather-details">
            <div className="detail-item" id="feels-like">
              <span className="detail-icon">🌡️</span>
              <div>
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{Math.round(weather.feelsLike)}°C</span>
              </div>
            </div>
            <div className="detail-item" id="humidity">
              <span className="detail-icon">💧</span>
              <div>
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
            </div>
            <div className="detail-item" id="wind-speed">
              <span className="detail-icon">💨</span>
              <div>
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Powered by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></p>
      </footer>
    </div>
  )
}

export default App
