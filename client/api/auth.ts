// Step 1 of the CMS login: send the editor's popup to GitHub to sign in.
// Needs GITHUB_CLIENT_ID (and GITHUB_CLIENT_SECRET for step 2) in Vercel's environment variables.
import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export default function auth(req: IncomingMessage, res: ServerResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.end('GITHUB_CLIENT_ID is not set in Vercel environment variables.');
    return;
  }
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const state = randomBytes(16).toString('hex');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', `https://${host}/api/callback`);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);
  // The state cookie lets the callback check the response came from this login.
  res.setHeader('Set-Cookie', `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
}
