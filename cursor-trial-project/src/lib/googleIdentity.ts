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
    // #region agent log
    fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H1',location:'googleIdentity.ts:loadGoogleIdentityScript:cached-ready',message:'Google identity already available',data:{hasGoogle:true},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    return
  }

  if (identityScriptPromise) {
    return identityScriptPromise
  }

  identityScriptPromise = new Promise<void>((resolve, reject) => {
    // #region agent log
    fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H1',location:'googleIdentity.ts:loadGoogleIdentityScript:create-script',message:'Injecting Google identity script tag',data:{scriptSrc:GOOGLE_IDENTITY_SCRIPT},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => {
      // #region agent log
      fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H1',location:'googleIdentity.ts:loadGoogleIdentityScript:onload',message:'Google identity script loaded',data:{loaded:true},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
      resolve()
    }
    script.onerror = () => {
      // #region agent log
      fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H1',location:'googleIdentity.ts:loadGoogleIdentityScript:onerror',message:'Google identity script failed to load',data:{loaded:false},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
      reject(new Error('Failed to load Google Identity script.'))
    }
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
  // #region agent log
  fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H2',location:'googleIdentity.ts:requestGoogleAccessToken:entry',message:'Entered token request',data:{hasOAuth2:Boolean(window.google?.accounts?.oauth2),hasClientId:Boolean(input.clientId),scopeCount:input.scope.split(' ').filter(Boolean).length},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H3',location:'googleIdentity.ts:requestGoogleAccessToken:callback',message:'Token callback fired',data:{hasAccessToken:Boolean(response.access_token),error:response.error ?? null},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H4',location:'googleIdentity.ts:requestGoogleAccessToken:error_callback',message:'Token error callback fired',data:{isObject:typeof error === 'object' && error !== null,errorType:typeof error === 'object' && error !== null && 'type' in (error as Record<string, unknown>) ? String((error as Record<string, unknown>).type) : null,errorMessage:typeof error === 'object' && error !== null && 'message' in (error as Record<string, unknown>) ? String((error as Record<string, unknown>).message) : null},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
        reject(
          new Error(
            `Google sign-in was cancelled or failed.${
              details ? ` Details: ${details}` : ''
            }`,
          ),
        )
      },
    })

    // #region agent log
    fetch('http://127.0.0.1:7831/ingest/1e7e55b2-c31c-4ccc-aa98-21f3500a1d2f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'264ee2'},body:JSON.stringify({sessionId:'264ee2',runId:'pre-fix',hypothesisId:'H5',location:'googleIdentity.ts:requestGoogleAccessToken:requestAccessToken',message:'Requesting access token popup',data:{prompt:'consent'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
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
