export type CalendarEvent = {
  id: string
  summary: string
  start: string
  end?: string
}

type CalendarEventsResponse = {
  items?: Array<{
    id?: string
    summary?: string
    start?: { dateTime?: string; date?: string }
    end?: { dateTime?: string; date?: string }
  }>
}

export async function fetchUpcomingCalendarEvents(input: {
  accessToken: string
  maxResults?: number
}): Promise<CalendarEvent[]> {
  const url = new URL(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
  )
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('timeMin', new Date().toISOString())
  url.searchParams.set('maxResults', String(input.maxResults ?? 6))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google session expired. Please sign in again.')
    }
    throw new Error('Unable to fetch calendar events.')
  }

  const data = (await response.json()) as CalendarEventsResponse
  const events = data.items ?? []

  return events
    .filter((event) => event.id && (event.start?.dateTime || event.start?.date))
    .map((event) => ({
      id: event.id as string,
      summary: event.summary || 'Untitled event',
      start: (event.start?.dateTime || event.start?.date) as string,
      end: event.end?.dateTime || event.end?.date,
    }))
}
