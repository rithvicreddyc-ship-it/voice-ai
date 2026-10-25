/**
 * InGPT Weather Service
 * Live weather information using Open-Meteo API (free, reliable, no API key required).
 */

export async function getWeather(location = 'London') {
  try {
    // 1. Geocode location
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(4000) });
    if (!geoRes.ok) throw new Error(`Geocoding failed with status ${geoRes.status}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return {
        error: true,
        message: `Could not find location "${location}". Please specify city or country.`
      };
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];

    // 2. Fetch current weather and daily forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(4000) });
    if (!weatherRes.ok) throw new Error(`Weather fetch failed with status ${weatherRes.status}`);
    const weatherData = await weatherRes.json();

    const current = weatherData.current || {};
    const code = current.weather_code;
    const condition = getWeatherCondition(code);

    return {
      success: true,
      location: `${name}${admin1 ? ', ' + admin1 : ''}, ${country || ''}`,
      coordinates: { latitude, longitude },
      temperature: `${Math.round(current.temperature_2m)}°C`,
      feelsLike: `${Math.round(current.apparent_temperature)}°C`,
      humidity: `${current.relative_humidity_2m}%`,
      windSpeed: `${current.wind_speed_10m} km/h`,
      condition: condition.description,
      isDay: current.is_day === 1,
      timestamp: current.time || new Date().toISOString()
    };
  } catch (err) {
    console.warn(`Weather service error for "${location}":`, err.message);
    return {
      error: true,
      message: `Unable to retrieve live weather for "${location}" at this moment (${err.message}).`
    };
  }
}

function getWeatherCondition(code) {
  const mapping = {
    0: { description: 'Clear sky' },
    1: { description: 'Mainly clear' },
    2: { description: 'Partly cloudy' },
    3: { description: 'Overcast' },
    45: { description: 'Fog' },
    48: { description: 'Depositing rime fog' },
    51: { description: 'Light drizzle' },
    53: { description: 'Moderate drizzle' },
    55: { description: 'Dense drizzle' },
    61: { description: 'Slight rain' },
    63: { description: 'Moderate rain' },
    65: { description: 'Heavy rain' },
    71: { description: 'Slight snow fall' },
    73: { description: 'Moderate snow fall' },
    75: { description: 'Heavy snow fall' },
    80: { description: 'Slight rain showers' },
    81: { description: 'Moderate rain showers' },
    82: { description: 'Violent rain showers' },
    95: { description: 'Thunderstorm' },
    96: { description: 'Thunderstorm with slight hail' },
    99: { description: 'Thunderstorm with heavy hail' }
  };
  return mapping[code] || { description: 'Fair' };
}
