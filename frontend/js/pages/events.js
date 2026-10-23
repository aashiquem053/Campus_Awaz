import { api } from '../core/api.js';
import { E, fdate } from '../core/utils.js';
import { box } from '../core/router.js';
import { dRow } from './documents.js';

export async function pEv() {
  const [e, d] = await Promise.all([api('/events'), api('/docs')]), n = d.filter(x => x.cat === 'notice');
  box('<h3>Events &amp; notices</h3>' + (e.map(x => `<div class="it"><b>${E(x.title)}</b><p>${E(x.k)} &middot; ${fdate(x.d)}${x.tm ? ' &middot; ' + E(x.tm) : ''}</p>${x.x ? `<p>${E(x.x)}</p>` : ''}</div>`).join('') + n.map(x => dRow(x)).join('') || '<p class="mu">Nothing scheduled.</p>'));
}
