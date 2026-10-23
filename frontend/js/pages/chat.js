import { api } from '../core/api.js';
import { S } from '../core/state.js';
import { $, E } from '../core/utils.js';
import { action } from '../core/actions.js';
import { pg } from '../core/router.js';
import { speak, toggleMic, voiceList, getVoice, setVoice, stopSpeaking } from '../services/voice.js';

export function pChat() {
  pg(`<main class="g"><section class="cd"><h3>Awaaz AI Assistant <select id="vs" title="Assistant voice" data-change="voice">${voiceList().map(v => `<option value="${E(v.id)}" ${v.id === getVoice() ? 'selected' : ''}>${E(v.name)}</option>`).join('')}</select></h3>
<div id="log"></div>
<div class="in" style="margin-top:12px"><button id="mb" class="mc" data-a="mic" title="Speak"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></button>
<input id="qi" placeholder="Ask in English, हिंदी or Hinglish..." data-enter="send"><button class="bt" data-a="send">Send</button></div></section>
<div class="col"><div class="cd" id="tdc"></div></div></main>`);
  drawLog(); return today();
}

function drawLog() {
  const l = $('#log'); if (!l) return;
  l.innerHTML = S.chat.map(m => `<div class="m ${m.w}">${E(m.t)}</div>`).join(''); l.scrollTop = l.scrollHeight;
}

async function send(text) {
  const i = $('#qi'), x = (typeof text === 'string' ? text : i.value).trim(); if (!x) return;
  i.value = ''; S.chat.push({ w: 'u', t: x }); drawLog();
  try { const r = await api('/chat', { body: { t: x } }); S.chat.push({ w: 'b', t: r.a }); drawLog(); speak(r.a, r.lang); }   // answer comes back in the user's language
  catch (e) { S.chat.push({ w: 'b', t: 'Error: ' + e.message }); drawLog(); }
}

export async function today() {
  const r = await api('/today'), el = $('#tdc'); if (!el) return;
  el.innerHTML = `<h3>Today &middot; ${r.day}</h3>` + (r.blocks === null ? '<p class="mu">Timetable for your section isn’t uploaded yet. Ask the assistant, it will notify the admin.</p>'
    : r.blocks.length ? r.blocks.map(b => `<div class="it ${b.on ? 'on' : ''}"><b>${b.t}</b> ${E(b.s)}${b.f ? `<p>${E(b.f)} &middot; ${E(b.p)}${b.sec ? ' &middot; ' + E(b.sec) : ''}</p>` : ''}</div>`).join('') : '<p class="mu">No classes today</p>');
}

action('send', () => send());
action('mic', () => { stopSpeaking(); return toggleMic(t => send(t)); });
action('voice', (d, el) => { setVoice(el.value); speak('Hello, this is my voice', 0); });
