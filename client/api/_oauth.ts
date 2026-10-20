// Shared pieces for the CMS login functions. The leading underscore keeps Vercel from serving this file.
import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export const siteOrigin = (req: IncomingMessage) => `https://${req.headers['x-forwarded-host'] ?? req.headers.host}`;

export function query(req: IncomingMessage) {
  return new URL(req.url ?? '', 'http://x').searchParams;
}

/** Start a login: remember a random state in a short-lived cookie, then redirect to the provider. */
export function redirectWithState(res: ServerResponse, url: URL) {
  const state = randomBytes(16).toString('hex');
  url.searchParams.set('state', state);
  res.setHeader('Set-Cookie', `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
}

/** True when the provider sent back the same state we set, so the response belongs to this login. */
export function stateMatches(req: IncomingMessage) {
  const cookie = /(?:^|;\s*)cms_oauth_state=([a-f0-9]+)/.exec(req.headers.cookie ?? '')?.[1];
  return !!cookie && cookie === query(req).get('state');
}

/**
 * Finish a login by handing the result to the editor window that opened this popup.
 * Decap pings first; we only answer the editor on this same site.
 */
export function finish(req: IncomingMessage, res: ServerResponse, status: 'success' | 'error', content: object) {
  const origin = siteOrigin(req);
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const note = status === 'error' ? `<p>${'message' in content ? String(content.message) : 'Sign-in failed.'}</p><p>You can close this window.</p>` : '<p>Signing in…</p>';
  res.setHeader('Set-Cookie', 'cms_oauth_state=; Path=/api; Max-Age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><meta charset="utf-8"><title>Sakalam CMS</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:90vh;color:#183b22;text-align:center}</style>
${note}
<script>
  (function () {
    var origin = ${JSON.stringify(origin)};
    if (!window.opener) return;
    window.addEventListener('message', function (e) {
      if (e.origin !== origin) return;
      window.opener.postMessage(${JSON.stringify(message)}, origin);
    }, { once: true });
    window.opener.postMessage('authorizing:github', origin);
  })();
</script>`);
}
