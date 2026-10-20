// The CMS login popup. Shows a choice of Google or GitHub, then starts that provider's sign-in.
//
// Vercel environment variables:
//   GitHub sign-in:  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
//   Google sign-in:  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CMS_ALLOWED_EMAILS, GITHUB_CMS_TOKEN
import type { IncomingMessage, ServerResponse } from 'node:http';
import { query, redirectWithState, siteOrigin } from './_oauth.js';

const chooser = (google: boolean, github: boolean) => `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sign in · Sakalam Overland</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f5f1;color:#183b22;display:grid;place-items:center;min-height:100vh}
  main{width:min(320px,90vw);text-align:center}
  img{width:64px;height:64px}
  h1{font-size:1.25rem;margin:.75rem 0 1.5rem}
  a{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.6rem 0;padding:.8rem 1rem;border-radius:999px;font-weight:600;text-decoration:none;border:1px solid #d9ddd6;background:#fff;color:#1f1f1f}
  a.gh{background:#183b22;color:#fff;border-color:#183b22}
  a:focus-visible{outline:3px solid #f6b81a;outline-offset:2px}
  p{font-size:.8rem;color:#5c625e;margin-top:1.25rem}
</style>
<main>
  <img src="/brand/mark-forest.png" alt="">
  <h1>Sign in to edit the site</h1>
  ${google ? `<a href="/api/auth?go=google"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.8-6a24 24 0 0 0 0 21.4l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</a>` : ''}
  ${github ? `<a class="gh" href="/api/auth?go=github"><svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 16 8c0-4.4-3.6-8-8-8z"/></svg>Continue with GitHub</a>` : ''}
  ${!google && !github ? '<p>Sign-in is not set up yet. Ask the site manager to add the login keys in Vercel.</p>' : '<p>Only people added by the site manager can sign in.</p>'}
</main></html>`;

export default function auth(req: IncomingMessage, res: ServerResponse) {
  const origin = siteOrigin(req);
  const env = process.env;
  const google = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GITHUB_CMS_TOKEN && env.CMS_ALLOWED_EMAILS);
  const github = !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
  const go = query(req).get('go');

  if (go === 'github' && github) {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', env.GITHUB_CLIENT_ID!);
    url.searchParams.set('redirect_uri', `${origin}/api/callback`);
    url.searchParams.set('scope', 'repo,user');
    return redirectWithState(res, url);
  }
  if (go === 'google' && google) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
    url.searchParams.set('redirect_uri', `${origin}/api/google-callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email');
    url.searchParams.set('prompt', 'select_account');
    return redirectWithState(res, url);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(chooser(google, github));
}
