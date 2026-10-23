import { api } from '../core/api.js';
import { $, E, ftime, toast } from '../core/utils.js';
import { action } from '../core/actions.js';
import { box, act } from '../core/router.js';
import { dRow } from './documents.js';

const ta = (id, ph) => `<textarea id="${id}" placeholder="${ph}"></textarea>`;

export async function aQ() {
  const l = await api('/admin/queries');
  box(`<h3>Unanswered questions (${l.length})</h3>` + (l.map(x => `<div class="it"><b>${E(x.q)}</b><br><small>${E(x.who)} &middot; ${ftime(x.ts)}</small>${ta('a' + x.id, 'Your answer. The assistant will learn it and the user gets it by email')}<button class="bt" data-a="answerQ" data-id="${x.id}">Reply &amp; teach AI</button></div>`).join('') || '<p class="mu">No pending questions</p>'));
}

export async function aC() {
  const l = await api('/complaints');
  box('<h3>Complaints</h3>' + (l.map(x => `<div class="it"><b>${E(x.t)}</b><br><small>${E(x.who)} &middot; ${ftime(x.ts)}</small>${x.r ? `<p>Resolved: ${E(x.r)}</p>` : `${ta('c' + x.id, 'Response')}<button class="bt" data-a="resolve" data-id="${x.id}">Respond &amp; resolve</button>`}</div>`).join('') || '<p class="mu">No complaints yet.</p>'));
}

export async function aN() {
  box(`<h3>Announce an event</h3><div class="row"><label>Type<select id="ek">${['Event', 'Competition', 'Fees', 'Sports', 'Holiday', 'Notice'].map(k => `<option>${k}</option>`).join('')}</select></label><label>Title<input id="et"></label><label>Date<input id="ed" type="date"></label><label>Time<input id="em" placeholder="e.g. 10:00 AM"></label></div><label>Details<input id="ex"></label>
<button class="bt" data-a="announce">Publish &amp; notify students</button>`);
}

export async function aU() {
  const d = (await api('/docs')).filter(x => x.cat === 'notice');
  box(`<h3>Upload a notice <span class="pill">pdf · docx · xlsx · jpg · jpeg</span></h3><div class="fx"><input id="uf" type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg"><input id="ut" class="grow" placeholder="Notice title"><button class="bt" data-a="upload">Upload</button></div>
<p class="mu">After uploading, press <b>Publish</b> to show it to students and notify them.</p>` + d.map(x => dRow(x, 1)).join(''));
}

export async function aR() {
  const l = await api('/admin/rooms');
  box(`<h3>Room change</h3><div class="row"><label>Engaged room<input id="rf" placeholder="e.g. 602"></label><label>Alternative<input id="rt" placeholder="e.g. Lab 3, Wing B, 6th Floor"></label><label>Reason<input id="rn"></label></div>
<button class="bt" data-a="room">Announce change</button><p></p>` + l.map(x => `<div class="it">Room ${E(x.f)} &rarr; ${E(x.t)} <button class="lk" data-a="delRoom" data-id="${x.id}">Remove</button></div>`).join(''));
}

action('answerQ', d => act(() => api(`/admin/queries/${d.id}`, { body: { t: $('#a' + d.id).value } }), 'Answer saved'));
action('resolve', d => act(() => api(`/admin/complaints/${d.id}`, { body: { t: $('#c' + d.id).value } }), 'Resolved'));
action('announce', () => act(() => api('/admin/events', { body: { k: $('#ek').value, title: $('#et').value, d: $('#ed').value, tm: $('#em').value, x: $('#ex').value } }), 'Published & students notified'));
action('room', () => act(() => api('/admin/rooms', { body: { f: $('#rf').value, t: $('#rt').value, n: $('#rn').value } }), 'Announced'));
action('delRoom', d => act(() => api(`/admin/rooms/${d.id}`, { method: 'DELETE' })));
action('upload', () => {
  const f = $('#uf').files[0]; if (!f) return toast('Choose a file first');
  const fd = new FormData(); fd.append('file', f); fd.append('title', $('#ut').value);
  return act(() => api('/admin/upload', { body: fd }), 'Uploaded. Now press Publish');
});
