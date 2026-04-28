import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { fetchUpcomingCalendarEvents, type CalendarEvent } from '../lib/googleCalendar'

type GoogleCalendarWidgetProps = {
  accessToken: string | null
}

const CALENDAR_WIDGET_HEIGHT = 320

function formatEventDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function GoogleCalendarWidget({ accessToken }: GoogleCalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!accessToken) {
        setEvents([])
        setError('Sign in with Google to load your calendar.')
        return
      }

      setLoading(true)
      setError(null)
      try {
        const upcoming = await fetchUpcomingCalendarEvents({ accessToken })
        if (!cancelled) {
          setEvents(upcoming)
        }
      } catch (e) {
        if (!cancelled) {
          setEvents([])
          setError(
            e instanceof Error ? e.message : 'Unable to fetch calendar events.',
          )
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
  }, [accessToken])

  const refresh = () => {
    if (!accessToken) {
      setError('Sign in with Google to load your calendar.')
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const upcoming = await fetchUpcomingCalendarEvents({ accessToken })
        setEvents(upcoming)
      } catch (e) {
        setEvents([])
        setError(e instanceof Error ? e.message : 'Unable to fetch calendar events.')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <Card
      sx={{
        height: CALENDAR_WIDGET_HEIGHT,
        maxHeight: CALENDAR_WIDGET_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">Calendar</Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={loading || !accessToken}
            onClick={refresh}
            startIcon={<RefreshRoundedIcon />}
          >
            Refresh
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading events...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Typography variant="body2" color="error" sx={{ flexShrink: 0 }}>
            {error}
          </Typography>
        )}

        {!accessToken && (
          <Box
            sx={{
              border: '1px dashed #d7dde1',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              bgcolor: '#fbfcfc',
              flexShrink: 0,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Connect Google to view your upcoming events.
            </Typography>
            <Button disabled variant="outlined" size="small">
              Connect Google Account
            </Button>
          </Box>
        )}

        {!loading && !error && (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming events found.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {events.map((event) => (
                  <Box
                    key={event.id}
                    sx={{ p: 1.25, borderRadius: 1, bgcolor: 'grey.100' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatEventDate(event.start)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
