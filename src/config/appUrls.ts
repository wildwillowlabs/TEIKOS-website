/**
 * TEIKOS web app entry points (signup / login / in-app docs).
 * Set `VITE_APP_SIGNUP_URL` and `VITE_APP_LOGIN_URL` in `.env`, then restart the dev server.
 * Until set, links fall back to `#` so the UI still renders.
 * Optional `VITE_APP_DOCS_URL` overrides the in-app docs link (defaults to app.teikos.io/docs).
 */
function envUrl(key: string): string {
  const raw = import.meta.env[key] as string | undefined;
  const t = raw?.trim();
  return t && t.length > 0 ? t : '#';
}

function envUrlOrDefault(key: string, fallback: string): string {
  const raw = import.meta.env[key] as string | undefined;
  const t = raw?.trim();
  return t && t.length > 0 ? t : fallback;
}

export const APP_SIGNUP_URL = envUrl('VITE_APP_SIGNUP_URL');
export const APP_LOGIN_URL = envUrl('VITE_APP_LOGIN_URL');
export const APP_DOCS_URL = envUrlOrDefault(
  'VITE_APP_DOCS_URL',
  'https://app.teikos.io/docs',
);

/** Public contact email (FAQ, footer, etc.) */
export const CONTACT_EMAIL = 'hello@teikos.io';
export const CONTACT_MAILTO_URL = `mailto:${CONTACT_EMAIL}`;
