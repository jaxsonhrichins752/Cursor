import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
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

function isAllDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function formatAllDayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) {
    return dateStr
  }
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatEventTimeRange(start: string, end?: string): string {
  if (isAllDay(start)) {
    const startLabel = formatAllDayDate(start)
    if (end && isAllDay(end)) {
      return `${startLabel} – ${formatAllDayDate(end)} (all day)`
    }
    return `${startLabel} (all day)`
  }
  const startLabel = formatEventDate(start)
  if (end && !isAllDay(end)) {
    return `${startLabel} – ${formatEventDate(end)}`
  }
  return startLabel
}

export function GoogleCalendarWidget({ accessToken }: GoogleCalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

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
                  <ButtonBase
                    key={event.id}
                    focusRipple
                    onClick={() => setSelectedEvent(event)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: 1,
                      p: 1.25,
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.summary}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="span"
                      sx={{ display: 'block' }}
                    >
                      {isAllDay(event.start)
                        ? `${formatAllDayDate(event.start)} (all day)`
                        : formatEventDate(event.start)}
                    </Typography>
                  </ButtonBase>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="calendar-event-detail-title"
      >
        {selectedEvent && (
          <>
            <DialogTitle id="calendar-event-detail-title">
              {selectedEvent.summary}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    When
                  </Typography>
                  <Typography variant="body2">
                    {formatEventTimeRange(selectedEvent.start, selectedEvent.end)}
                  </Typography>
                </Box>
                {selectedEvent.location ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Location
                    </Typography>
                    <Typography variant="body2">{selectedEvent.location}</Typography>
                  </Box>
                ) : null}
                {selectedEvent.description ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Description
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                ) : null}
                {!selectedEvent.location &&
                !selectedEvent.description &&
                selectedEvent.htmlLink ? (
                  <Typography variant="body2" color="text.secondary">
                    No extra details in the list response. Open in Google Calendar for more.
                  </Typography>
                ) : null}
                {selectedEvent.htmlLink ? (
                  <Link
                    href={selectedEvent.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                  >
                    Open in Google Calendar
                  </Link>
                ) : null}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  )
}
