export type MtgCard = {
  id: string
  name: string
  manaCost: string
  oracleText: string
  marketValue: string
  imageUrl?: string
  scryfallUri?: string
}

type ScryfallCardResponse = {
  id: string
  name?: string
  mana_cost?: string
  oracle_text?: string
  prices?: {
    usd?: string | null
    usd_foil?: string | null
    eur?: string | null
    tix?: string | null
  }
  image_uris?: {
    normal?: string
    small?: string
  }
  card_faces?: Array<{
    oracle_text?: string
    image_uris?: {
      normal?: string
      small?: string
    }
  }>
  scryfall_uri?: string
}

function formatMarketValue(
  prices: ScryfallCardResponse['prices'] | undefined,
): string {
  if (!prices) {
    return 'Market value unavailable'
  }

  if (prices.usd) {
    return `$${prices.usd} USD`
  }
  if (prices.usd_foil) {
    return `$${prices.usd_foil} USD (foil)`
  }
  if (prices.eur) {
    return `EUR ${prices.eur}`
  }
  if (prices.tix) {
    return `${prices.tix} TIX`
  }

  return 'Market value unavailable'
}

export async function fetchRandomMtgCard(): Promise<MtgCard> {
  const response = await fetch('https://api.scryfall.com/cards/random')

  if (!response.ok) {
    throw new Error('Unable to fetch card from Scryfall.')
  }

  const data = (await response.json()) as ScryfallCardResponse

  const oracleText =
    data.oracle_text ||
    data.card_faces
      ?.map((face) => face.oracle_text)
      .filter(Boolean)
      .join('\n\n') ||
    'No rules text available.'

  const imageUrl =
    data.image_uris?.normal ||
    data.card_faces?.[0]?.image_uris?.normal ||
    data.image_uris?.small ||
    data.card_faces?.[0]?.image_uris?.small

  return {
    id: data.id,
    name: data.name || 'Unknown Card',
    manaCost: data.mana_cost || 'N/A',
    oracleText,
    marketValue: formatMarketValue(data.prices),
    imageUrl,
    scryfallUri: data.scryfall_uri,
  }
}
