// Step 2 of the CMS login: trade GitHub's one-time code for a token and hand it to the editor window.
import type { IncomingMessage, ServerResponse } from 'node:http';

function page(res: ServerResponse, origin: string, status: 'success' | 'error', content: object) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><meta charset="utf-8"><title>Signing in…</title><p>Signing in…</p>
<script>
  (function () {
    var origin = ${JSON.stringify(origin)};
    // Decap pings us first; only answer the editor on this site.
    window.addEventListener('message', function (e) {
      if (e.origin !== origin) return;
      window.opener.postMessage(${JSON.stringify(message)}, origin);
    }, { once: true });
    window.opener.postMessage('authorizing:github', origin);
  })();
</script>`);
}

export default async function callback(req: IncomingMessage, res: ServerResponse) {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const origin = `https://${host}`;
  const params = new URL(req.url ?? '', origin).searchParams;
  const cookieState = /(?:^|;\s*)cms_oauth_state=([a-f0-9]+)/.exec(req.headers.cookie ?? '')?.[1];

  if (!params.get('code') || !cookieState || cookieState !== params.get('state')) {
    page(res, origin, 'error', { message: 'Login expired or was interrupted. Close this window and try again.' });
    return;
  }

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: params.get('code'),
      }),
    });
    const data = (await r.json()) as { access_token?: string; error_description?: string };
    if (!data.access_token) throw new Error(data.error_description ?? 'No token returned');
    res.setHeader('Set-Cookie', 'cms_oauth_state=; Path=/api; Max-Age=0');
    page(res, origin, 'success', { token: data.access_token, provider: 'github' });
  } catch (err) {
    page(res, origin, 'error', { message: (err as Error).message });
  }
}
