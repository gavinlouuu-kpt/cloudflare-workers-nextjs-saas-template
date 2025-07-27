interface CloudflareEnv {
  // TODO Remove them from here because we are not longer loading them from the Cloudflare Context
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  BREVO_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NEXT_PUBLIC_SAM_API_URL?: string;
  SAM_API_KEY?: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SAM_API_URL?: string;
    SAM_API_KEY?: string;
  }
}
