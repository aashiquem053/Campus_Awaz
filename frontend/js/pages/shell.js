import { api } from '../core/api.js';
import { S } from '../core/state.js';
import { $, E, firstName } from '../core/utils.js';
import { action } from '../core/actions.js';
import { go } from '../core/router.js';
import { stopPolling } from '../services/notifier.js';
import { stopSpeaking } from '../services/voice.js';
import { authView } from './auth.js';

// Tabs per role. Faculty: no events, documents or complaints. Plain text only - no icons.
export const TABS = role => role === 'admin'
  ? [['aq', 'Queries'], ['ac', 'Complaints'], ['an', 'Announce'], ['au', 'Upload notice'], ['ar', 'Room change'], ['dc', 'Documents']]
  : role === 'faculty'
    ? [['chat', 'Assistant'], ['nt', 'Notifications']]
    : [['chat', 'Assistant'], ['ev', 'Events & Notices'], ['nt', 'Notifications'], ['cp', 'Complaints'], ['dc', 'Documents']];

export function shell() {
  const m = S.me, a = m.role === 'admin', init = (firstName(m.name)[0] || 'A').toUpperCase();
  $('#app').innerHTML = `<header class="hd"><div class="lg"><span class="lm">CA</span>Campus Awaaz</div>
<div class="rt"><div class="clk"><i class="dot"></i><span id="dw"></span><b id="tm"></b><em>IST</em></div>
<div class="pf"><span class="av">${E(init)}</span><div><b>${E(m.name)}</b><small>${E(a ? 'Administrator' : m.section || 'Faculty')}</small></div><button class="x" data-a="logout">Logout</button></div></div></header>
<div class="tabs"><div class="tb">${TABS(m.role).map(t => `<button data-a="go" data-arg="${t[0]}">${E(t[1])}${t[0] === 'nt' ? '<sup id="nb"></sup>' : ''}</button>`).join('')}</div></div><div id="pg"></div>`;
  tick(); go(S.view);
}

export function tick() {
  const d = new Date(), w = $('#dw'); if (!w) return;
  const IST = { timeZone: 'Asia/Kolkata' };
  w.textContent = d.toLocaleDateString('en-IN', { ...IST, weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  $('#tm').textContent = d.toLocaleTimeString('en-IN', { ...IST, hour12: true }).toUpperCase();
}

export async function logout(callApi = true) {
  if (callApi) { try { await api('/logout', { method: 'POST' }); } catch (e) { /* ignore */ } }
  stopPolling(); stopSpeaking();
  S.token = ''; localStorage.removeItem('tk'); S.me = null; S.notes = []; S.lastId = null; authView();
}

action('go', d => go(d.arg));
action('logout', () => logout());
action('closePop', (d, el) => el.parentElement.remove());
