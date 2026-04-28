import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { fetchRandomMtgCard, type MtgCard } from '../lib/scryfall'

const CACHE_KEY = 'mtg-card-of-day'

type CachedCard = {
  date: string
  card: MtgCard
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function readCachedCard(): CachedCard | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as CachedCard
    if (!parsed?.date || !parsed?.card?.id) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCachedCard(card: MtgCard) {
  const payload: CachedCard = { date: getTodayKey(), card }
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
}

export function MtgCardOfDayWidget() {
  const [card, setCard] = useState<MtgCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCard = (forceNew = false) => {
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        if (!forceNew) {
          const cached = readCachedCard()
          if (cached && cached.date === getTodayKey()) {
            setCard(cached.card)
            return
          }
        }

        const result = await fetchRandomMtgCard()
        setCard(result)
        writeCachedCard(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load card of the day.')
      } finally {
        setLoading(false)
      }
    })()
  }

  useEffect(() => {
    loadCard(false)
  }, [])

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: 2,
            gap: 1,
          }}
        >
          <Typography variant="h6">MTG Card of the Day</Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={loading}
            onClick={() => loadCard(true)}
            startIcon={<RefreshRoundedIcon />}
          >
            New Card
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Pulling from Scryfall...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {!loading && !error && card && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            {card.imageUrl && (
              <Box
                component="img"
                src={card.imageUrl}
                alt={card.name}
                sx={{
                  width: { xs: 120, sm: 156 },
                  borderRadius: 1,
                  flexShrink: 0,
                  boxShadow: 2,
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'rotate(-1.2deg) translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                  },
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {card.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Casting Cost: {card.manaCost}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {card.oracleText}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5 }}>
                Market Value: {card.marketValue}
              </Typography>
              {card.scryfallUri && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                  <a href={card.scryfallUri} target="_blank" rel="noreferrer">
                    View on Scryfall
                  </a>
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
