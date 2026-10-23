// Single shared state object for the whole UI.
export const S = {
  token: localStorage.tk || '',
  me: null,            // {name,email,role,section}
  view: 'chat',
  chat: [],            // assistant conversation
  notes: [], seen: 0, lastId: null, timer: null,
  secs: [],            // sections list for signup
  authRole: 'student', authMode: 'in',
};
