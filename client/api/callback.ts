// GitHub sign-in, step 2: trade GitHub's one-time code for the person's own token.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { finish, query, stateMatches } from './_oauth.js';

export default async function callback(req: IncomingMessage, res: ServerResponse) {
  const code = query(req).get('code');
  if (!code || !stateMatches(req)) {
    return finish(req, res, 'error', { message: 'Login expired or was interrupted. Close this window and try again.' });
  }
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
    });
    const data = (await r.json()) as { access_token?: string; error_description?: string };
    if (!data.access_token) throw new Error(data.error_description ?? 'GitHub did not return a token.');
    finish(req, res, 'success', { token: data.access_token, provider: 'github' });
  } catch (err) {
    finish(req, res, 'error', { message: (err as Error).message });
  }
}
