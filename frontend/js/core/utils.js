import { S } from './state.js';

export const $ = s => document.querySelector(s);
export const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IST = { timeZone: 'Asia/Kolkata' };
export const fdate = s => new Date(s + 'T00:00:00+05:30').toLocaleDateString('en-IN', { ...IST, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const ftime = ts => new Date(ts * 1000).toLocaleString('en-IN', { ...IST, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
export const firstName = n => n.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, '').split(' ')[0];

export function toast(m) {
  const d = document.createElement('div'); d.className = 'ts'; d.textContent = m;
  document.body.appendChild(d); setTimeout(() => d.remove(), 5000);
}

export function badge() {                         // unread count on the Notifications tab
  const c = S.notes.filter(n => n.ts > S.seen).length, e = $('#nb');
  if (e) e.textContent = c || '';
}
