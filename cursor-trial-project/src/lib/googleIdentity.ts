type TokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

type TokenClient = {
  requestAccessToken: (overrides?: { prompt?: string }) => void
}

type GoogleIdentity = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: TokenResponse & { error?: string }) => void
        error_callback?: (error: unknown) => void
      }) => TokenClient
      revoke: (token: string, done: () => void) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'

let identityScriptPromise: Promise<void> | null = null

export async function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return
  }

  if (identityScriptPromise) {
    return identityScriptPromise
  }

  identityScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity script.'))
    document.head.appendChild(script)
  })

  return identityScriptPromise
}

export function isGoogleIdentityReady(): boolean {
  return Boolean(window.google?.accounts?.oauth2)
}

export async function requestGoogleAccessToken(input: {
  clientId: string
  scope: string
}): Promise<string> {
  const googleIdentity = window.google?.accounts?.oauth2
  if (!googleIdentity) {
    throw new Error(
      'Google sign-in is still initializing. Please wait a second and click Sign in again.',
    )
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = googleIdentity.initTokenClient({
      client_id: input.clientId,
      scope: input.scope,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'Google sign-in failed.'))
          return
        }
        resolve(response.access_token)
      },
      error_callback: (error) => {
        const details =
          typeof error === 'object' && error !== null
            ? JSON.stringify(error)
            : String(error ?? '')
        reject(
          new Error(
            `Google sign-in was cancelled or failed.${
              details ? ` Details: ${details}` : ''
            }`,
          ),
        )
      },
    })

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export async function revokeGoogleAccessToken(token: string): Promise<void> {
  await loadGoogleIdentityScript()
  const googleIdentity = window.google?.accounts?.oauth2
  if (!googleIdentity) {
    return
  }

  await new Promise<void>((resolve) => {
    googleIdentity.revoke(token, () => resolve())
  })
}

export type GoogleUserProfile = {
  name: string
  email: string
  picture?: string
}

export async function fetchGoogleUserProfile(
  accessToken: string,
): Promise<GoogleUserProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to fetch Google profile.')
  }

  const data = (await response.json()) as {
    name?: string
    email?: string
    picture?: string
  }

  return {
    name: data.name ?? 'Google User',
    email: data.email ?? '',
    picture: data.picture,
  }
}
