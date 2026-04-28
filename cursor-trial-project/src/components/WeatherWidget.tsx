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
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import CloudRoundedIcon from '@mui/icons-material/CloudRounded'
import ThunderstormRoundedIcon from '@mui/icons-material/ThunderstormRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import {
  fetchCurrentWeather,
  type CurrentWeather,
} from '../lib/openWeatherMap'

/**
 * Weather dashboard card.
 *
 * Responsibilities:
 * - Manages city input and submitted query state
 * - Fetches current weather via the OpenWeatherMap helper
 * - Handles loading/error/empty-success UI states
 * - Renders a compact weather summary for the dashboard
 *
 * Mental model:
 * - "city" is what the user is currently typing.
 * - "submittedCity" is the committed query that triggers fetches.
 */
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''
const DEFAULT_CITY =
  import.meta.env.VITE_WEATHER_DEFAULT_CITY ?? 'New York'
const WEATHER_WIDGET_HEIGHT = 280

// Visual mapper: convert weather descriptions into simple icon choices.
function WeatherGlyph({ description }: { description: string }) {
  const normalized = description.toLowerCase()
  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return <WaterDropRoundedIcon sx={{ fontSize: 42, color: '#4f7c95' }} />
  }
  if (normalized.includes('thunder') || normalized.includes('storm')) {
    return <ThunderstormRoundedIcon sx={{ fontSize: 42, color: '#5e6f7e' }} />
  }
  if (normalized.includes('cloud')) {
    return <CloudRoundedIcon sx={{ fontSize: 42, color: '#7b8a97' }} />
  }
  return <WbSunnyRoundedIcon sx={{ fontSize: 42, color: '#d7a84c' }} />
}

export function WeatherWidget() {
  // Read order for this component:
  // 1) Local state
  // 2) Fetch effect when query changes
  // 3) Manual refresh helper
  // 4) Form submit handler
  // 5) Render-state branches (key missing/loading/error/success)

  // Local widget state: input, committed query, request status, and result data.
  const [city, setCity] = useState(DEFAULT_CITY)
  const [submittedCity, setSubmittedCity] = useState(DEFAULT_CITY)
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Effect fetch: runs when submittedCity changes; uses cancellation guard.
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

  // Manual refresh path: re-fetch weather for the current submitted city.
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

  // Form submit: normalize user input and trigger a new query.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedCity(city.trim() || DEFAULT_CITY)
  }

  const tempUnit = '°F'

  // Render state machine: missing API key -> loading -> error -> success UI.
  return (
    <Card sx={{ height: WEATHER_WIDGET_HEIGHT }}>
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
          Weather
        </Typography>

        {/* Controls: city input, submit to change query, manual refresh button. */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2, flexShrink: 0 }}>
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

        {/* Results panel: exactly one branch is visible at a time. */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
          {!API_KEY && (
            // Key missing: show setup guidance instead of attempting fetches.
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
            // Request active: show spinner/status text.
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">
                Loading…
              </Typography>
            </Box>
          )}

          {!loading && error && (
            // Request failed: show normalized, user-friendly error.
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {!loading && !error && weather && (
            // Request succeeded: render weather snapshot card.
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  bgcolor: '#f4f7f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WeatherGlyph description={weather.description} />
              </Box>
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
        </Box>
      </CardContent>
    </Card>
  )
}
