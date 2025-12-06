// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  redirectUri: `${window.location.origin}/login`,
  scope: 'openid email profile'
}

// Google OAuth Helper Functions
export const initializeGoogleAuth = () => {
  if (typeof window === 'undefined') return

  // Load Google Identity Services script
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

export const createGoogleLoginButton = (callback: (response: any) => void) => {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services not loaded')
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CONFIG.clientId,
    callback: callback,
    auto_select: false,
    cancel_on_tap_outside: false
  })

  return window.google.accounts.id.prompt()
}

// Type definitions for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}
