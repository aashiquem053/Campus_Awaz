import { S } from './state.js';
import { $, toast, badge } from './utils.js';

const pages = {};
export const registerPages = p => Object.assign(pages, p);

export function go(v) {
  S.view = v;
  document.querySelectorAll('.tb button').forEach(b => b.classList.toggle('on', b.dataset.arg === v));
  Promise.resolve(pages[v]()).catch(e => toast(e.message));
  badge();
}

export const pg = h => { $('#pg').innerHTML = h; };
export const box = h => pg(`<main class="ad"><div class="cd">${h}</div></main>`);

// run an API call, show a toast, refresh the current page
export const act = async (f, ok) => { try { await f(); if (ok) toast(ok); go(S.view); } catch (e) { toast(e.message); } };
