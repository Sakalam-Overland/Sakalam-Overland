// Yahoo sign-in, step 2: confirm who signed in, check they're on the allowlist,
// then let the editor save with the site's limited GitHub key (GITHUB_CMS_TOKEN).
import type { IncomingMessage, ServerResponse } from 'node:http';
import { finish, finishEmailLogin, query, siteOrigin, stateMatches } from './_oauth.js';

export default async function yahooCallback(req: IncomingMessage, res: ServerResponse) {
  const code = query(req).get('code');
  if (!code || !stateMatches(req)) {
    return finish(req, res, 'error', { message: 'Login expired or was interrupted. Close this window and try again.' });
  }
  try {
    const r = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.YAHOO_CLIENT_ID ?? '',
        client_secret: process.env.YAHOO_CLIENT_SECRET ?? '',
        redirect_uri: `${siteOrigin(req)}/api/yahoo-callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = (await r.json()) as { access_token?: string; error_description?: string; error?: string };
    if (!tokens.access_token) throw new Error(tokens.error_description ?? tokens.error ?? 'Yahoo did not return a token.');

    // Ask Yahoo directly who this is, rather than trusting anything from the browser.
    const u = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const user = (await u.json()) as { email?: string; email_verified?: boolean | string };
    // Yahoo issues its own addresses, so only an explicit "not verified" is refused.
    finishEmailLogin(req, res, user.email, user.email_verified !== false && user.email_verified !== 'false');
  } catch (err) {
    finish(req, res, 'error', { message: (err as Error).message });
  }
}
