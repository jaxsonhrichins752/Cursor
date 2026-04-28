const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

/**
 * OpenWeatherMap API adapter.
 *
 * Responsibilities:
 * - Builds request URLs and query params
 * - Normalizes API responses into the app's `CurrentWeather` shape
 * - Converts network/API failures into user-friendly errors
 *
 * Mental model:
 * - UI components should call this function and avoid raw API details.
 */
export type CurrentWeather = {
  cityName: string
  country: string
  description: string
  iconCode: string
  temp: number
  feelsLike: number
  humidity: number
}

type OpenWeatherResponse = {
  name: string
  sys?: { country?: string }
  main?: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather?: Array<{ description?: string; icon?: string }>
}

export async function fetchCurrentWeather(
  apiKey: string,
  cityQuery: string,
  units: 'metric' | 'imperial' = 'imperial',
): Promise<CurrentWeather> {
  // Validate user input early before making any network request.
  const trimmedCity = cityQuery.trim()
  if (!trimmedCity) {
    throw new Error('Enter a city name.')
  }

  // Build query params expected by OpenWeatherMap.
  const params = new URLSearchParams({
    q: trimmedCity,
    appid: apiKey,
    units,
  })

  const response = await fetch(`${BASE_URL}?${params.toString()}`)

  // Map common HTTP statuses to clearer messages for UI display.
  if (response.status === 401) {
    throw new Error('Invalid API key. Check VITE_OPENWEATHER_API_KEY in your .env file.')
  }

  if (response.status === 404) {
    throw new Error('City not found. Try another spelling or add the country code (e.g. Portland,US).')
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new Error(message || `Weather request failed (${response.status}).`)
  }

  const data = (await response.json()) as OpenWeatherResponse
  const w0 = data.weather?.[0]
  const main = data.main

  // Guard against incomplete payloads before returning normalized data.
  if (!main || !w0?.description || !w0?.icon) {
    throw new Error('Unexpected response from OpenWeatherMap.')
  }

  return {
    cityName: data.name,
    country: data.sys?.country ?? '',
    description: w0.description,
    iconCode: w0.icon,
    temp: main.temp,
    feelsLike: main.feels_like,
    humidity: main.humidity,
  }
}

export function weatherIconUrl(iconCode: string) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
