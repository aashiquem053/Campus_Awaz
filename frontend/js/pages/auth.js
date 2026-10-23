import { api } from '../core/api.js';
import { S } from '../core/state.js';
import { $, E } from '../core/utils.js';
import { action } from '../core/actions.js';

export function authView() {
  const r = S.authRole, su = S.authMode === 'up' && r !== 'admin';
  $('#app').innerHTML = `<div class="au"><section class="hero"><div class="lg"><span class="lm">CA</span>Campus Awaaz</div>
<h1>Campus ki awaaz,<br>ab aapki <span>voice</span> me.</h1>
<p>One AI assistant for your classes, rooms, holidays, exams and events. Ask in English, हिंदी or Hinglish.</p>
<div class="fts"><span>Voice + chat</span><span>Class alerts on dashboard + email</span><span>Notices &amp; documents</span></div></section>
<section class="cd lc"><div class="rl">${['student', 'faculty', 'admin'].map(x => `<button class="${r === x ? 'on' : ''}" data-a="authRole" data-r="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
<h3>${su ? 'Create your ' + r + ' account' : r === 'admin' ? 'Admin login' : 'Welcome back'}</h3>
${su ? `<label>${r === 'faculty' ? 'Full name (as in the timetable)' : 'Full name'}<input id="nm"></label>` : ''}
<label>Email<input id="em" type="email" autocomplete="username"></label>
${su && r === 'student' ? `<label>University roll no.<input id="rl"></label><label>Section<select id="sc">${S.secs.map(s => `<option>${E(s.sec)}</option>`).join('')}</select></label>` : ''}
<label>Password<input id="pw" type="password" autocomplete="${su ? 'new-password' : 'current-password'}" data-enter="auth"></label>
<div class="er" id="er"></div><button class="bt" style="width:100%" data-a="auth">${su ? 'Sign up' : 'Login'}</button>
${r === 'admin' ? '<p class="sw">Admin accounts are fixed. Only the registered admins can login here.</p>'
    : `<p class="sw">${su ? 'Already registered?' : 'New here?'} <a data-a="authMode" data-m="${su ? 'in' : 'up'}">${su ? 'Login' : 'Sign up'}</a></p>`}</section></div>`;
}

action('authRole', d => { S.authRole = d.r; authView(); });
action('authMode', d => { S.authMode = d.m; authView(); });
action('auth', async () => {
  const g = i => ($('#' + i)?.value || '').trim(), su = S.authMode === 'up' && S.authRole !== 'admin';
  try {
    const body = su ? { name: g('nm'), email: g('em'), password: $('#pw').value, role: S.authRole, roll: g('rl'), section: g('sc') }
                    : { email: g('em'), password: $('#pw').value, role: S.authRole };
    const r = await api(su ? '/signup' : '/login', { body });
    S.token = r.token; localStorage.tk = r.token; window.dispatchEvent(new Event('logged-in'));
  } catch (e) { $('#er').textContent = e.message; }
});
