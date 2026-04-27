import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import {
  fetchCurrentWeather,
  weatherIconUrl,
  type CurrentWeather,
} from '../lib/openWeatherMap'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''
const DEFAULT_CITY =
  import.meta.env.VITE_WEATHER_DEFAULT_CITY ?? 'New York'

export function WeatherWidget() {
  const [city, setCity] = useState(DEFAULT_CITY)
  const [submittedCity, setSubmittedCity] = useState(DEFAULT_CITY)
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!API_KEY) {
        setError(
          'Add your OpenWeatherMap API key to a .env file as VITE_OPENWEATHER_API_KEY (see .env.example).',
        )
        setWeather(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await fetchCurrentWeather(API_KEY, submittedCity)
        if (!cancelled) {
          setWeather(result)
        }
      } catch (e) {
        if (!cancelled) {
          setWeather(null)
          setError(e instanceof Error ? e.message : 'Could not load weather.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [submittedCity])

  const load = () => {
    void (async () => {
      if (!API_KEY) {
        setError(
          'Add your OpenWeatherMap API key to a .env file as VITE_OPENWEATHER_API_KEY (see .env.example).',
        )
        setWeather(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await fetchCurrentWeather(API_KEY, submittedCity)
        setWeather(result)
      } catch (e) {
        setWeather(null)
        setError(e instanceof Error ? e.message : 'Could not load weather.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedCity(city.trim() || DEFAULT_CITY)
  }

  const tempUnit = '°F'

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Weather
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Austin,US"
            />
            <Button type="submit" variant="outlined" disabled={loading}>
              Update
            </Button>
            <Button
              type="button"
              variant="contained"
              disabled={loading}
              onClick={() => void load()}
              startIcon={<RefreshRoundedIcon />}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {!API_KEY && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
            Placeholder: set{' '}
            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
              VITE_OPENWEATHER_API_KEY=YOUR_KEY_HERE
            </Typography>{' '}
            in <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>.env</Typography>{' '}
            (copy from .env.example), then restart the dev server.
          </Typography>
        )}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={22} />
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {!loading && !error && weather && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={weatherIconUrl(weather.iconCode)}
              alt=""
              sx={{ width: 88, height: 88 }}
            />
            <Box>
              <Typography variant="h4" component="p">
                {Math.round(weather.temp)}
                {tempUnit}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {weather.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {weather.cityName}
                {weather.country ? `, ${weather.country}` : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Feels like {Math.round(weather.feelsLike)}
                {tempUnit} · Humidity {weather.humidity}%
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
