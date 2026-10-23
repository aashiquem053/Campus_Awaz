import { api } from '../core/api.js';
import { S } from '../core/state.js';
import { E, ftime, badge } from '../core/utils.js';
import { box } from '../core/router.js';

export async function pNt() {
  box(`<h3>Notifications <span class="pill">class alerts are also emailed to you</span></h3>` + (S.notes.length
    ? S.notes.map(n => `<div class="it ${n.ts > S.seen ? 'nw' : ''}"><b>${E(n.title)}</b><p>${E(n.body)}</p><small>${ftime(n.ts)}</small></div>`).join('') : '<p class="mu">No notifications yet.</p>'));
  await api('/notes/seen', { method: 'POST' });
  setTimeout(() => { S.seen = Date.now() / 1000; badge(); }, 1500);
}
