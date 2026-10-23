import { api } from '../core/api.js';
import { $, E } from '../core/utils.js';
import { action } from '../core/actions.js';
import { box, act } from '../core/router.js';

export async function pCp() {
  const l = await api('/complaints');
  box(`<h3>Complaint box</h3><textarea id="ct" rows="3" placeholder="Describe your issue. It goes straight to the admin (and you get the reply by email)"></textarea>
<button class="bt" style="margin:8px 0" data-a="sendComplaint">Submit complaint</button>` + l.map(c => `<div class="it"><b>${E(c.t)}</b><p>${c.r ? 'Admin: ' + E(c.r) : 'Pending'}</p></div>`).join(''));
}
action('sendComplaint', () => act(() => api('/complaints', { body: { t: $('#ct').value } }), 'Complaint sent to admin'));
