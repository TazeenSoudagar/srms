import type Echo from 'laravel-echo';

// Module-level singleton — only created once per client session
let echoInstance: Echo<'reverb'> | null = null;
let initPromise: Promise<Echo<'reverb'>> | null = null;

/**
 * Returns the shared Laravel Echo instance configured to use Reverb.
 * Uses dynamic import() to avoid CJS/ESM conflicts in Next.js webpack.
 * Safe to call multiple times — only one instance is ever created.
 * Returns null on the server (SSR).
 */
export async function getEcho(): Promise<Echo<'reverb'> | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  // Deduplicate concurrent calls during initialisation
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const [{ default: Pusher }, { default: EchoClass }] = await Promise.all([
      import('pusher-js'),
      import('laravel-echo'),
    ]);

    // Expose Pusher on window so Laravel Echo can resolve it internally
    (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;

    echoInstance = new EchoClass<'reverb'>({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? '8080', 10),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? '8080', 10),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    return echoInstance;
  })();

  return initPromise;
}

/**
 * Tears down the existing Echo connection. Call on user logout.
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    initPromise = null;
  }
}
