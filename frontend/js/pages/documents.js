import { api } from '../core/api.js';
import { S } from '../core/state.js';
import { E, ftime } from '../core/utils.js';
import { action } from '../core/actions.js';
import { box, act } from '../core/router.js';

export const dRow = (x, adm) => {
  const u = `/api/docs/${x.id}/file?t=${S.token}`, v = ['pdf', 'jpg', 'jpeg'].includes(x.ext);
  return `<div class="it ${adm && !x.pub ? 'nw' : ''}"><b>${E(x.title)}</b><p>${x.ext.toUpperCase()} &middot; ${ftime(x.ts)}${adm ? (x.pub ? ' &middot; published' : ' &middot; not published') : ''}</p>
${v ? `<a class="lk" target="_blank" href="${u}">View</a>` : ''}<a class="lk" href="${u}&dl=1">Download</a>
${adm ? `${x.pub ? '' : `<button class="lk" data-a="publishDoc" data-id="${x.id}">Publish</button>`}<button class="lk" data-a="deleteDoc" data-id="${x.id}">Delete</button>` : ''}</div>`;
};

export async function pDc() {
  const d = await api('/docs'), a = S.me.role === 'admin';
  box('<h3>Documents <span class="pill">timetables · syllabus · calendar · notices</span></h3>' + (d.map(x => dRow(x, a)).join('') || '<p class="mu">No documents yet.</p>'));
}

action('publishDoc', d => act(() => api(`/admin/docs/${d.id}/publish`, { method: 'POST' }), 'Published & students notified'));
action('deleteDoc', d => confirm('Delete?') && act(() => api(`/admin/docs/${d.id}`, { method: 'DELETE' })));
