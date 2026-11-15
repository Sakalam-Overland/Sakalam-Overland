// Google sign-in, step 2: confirm who signed in, check they're on the allowlist,
// then let the editor save with the site's limited GitHub key (GITHUB_CMS_TOKEN).
import type { IncomingMessage, ServerResponse } from 'node:http';
import { finish, finishEmailLogin, query, siteOrigin, stateMatches } from './_oauth.js';

export default async function googleCallback(req: IncomingMessage, res: ServerResponse) {
  const code = query(req).get('code');
  if (!code || !stateMatches(req)) {
    return finish(req, res, 'error', { message: 'Login expired or was interrupted. Close this window and try again.' });
  }
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: `${siteOrigin(req)}/api/google-callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = (await r.json()) as { access_token?: string; error_description?: string };
    if (!tokens.access_token) throw new Error(tokens.error_description ?? 'Google did not return a token.');

    // Ask Google directly who this is, rather than trusting anything from the browser.
    const u = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const user = (await u.json()) as { email?: string; email_verified?: boolean };
    finishEmailLogin(req, res, user.email, !!user.email_verified);
  } catch (err) {
    finish(req, res, 'error', { message: (err as Error).message });
  }
}
