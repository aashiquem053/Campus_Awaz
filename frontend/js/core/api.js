import { API_BASE } from '../config.js';
import { S } from './state.js';

export const apiUrl = p => API_BASE + '/api' + p;

export async function api(p, o = {}) {
  let body = o.body; const h = { 'X-Token': S.token };
  if (body && !(body instanceof FormData)) { h['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  const r = await fetch(apiUrl(p), { method: o.method || (body ? 'POST' : 'GET'), headers: h, body });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && S.me) { window.dispatchEvent(new Event('session-expired')); throw Error('Session expired, please login again'); }
  if (!r.ok) throw Error(j.detail || 'Something went wrong');
  return j;
}
