/* ==========================================================================
  
   The current login lives in sessionStorage only, so closing the tab ends it
   while the users/events/registrations stay in localStorage.

   Session shape:  { id: 3, username: "sara", role: "user" | "admin" }
   Role strings are exactly "user" and "admin" everywhere in the project.

   Public functions (all global):
     saveSession(user)     -> stores {id, username, role} for the logged-in user
     getSession()          -> the session object, or null for a guest
     clearSession()        -> logs the user out (session only)
     isAdmin() / isUser()  -> booleans for the current session
     homePageFor(role)     -> page a role lands on after login
   ========================================================================== */

var SESSION_KEY = 'eventhub_session';
var ROLE_USER = 'user';
var ROLE_ADMIN = 'admin';

function saveSession(user) {
  var session = { id: user.id, username: user.username, role: user.role };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error('Session: could not save the session.', error);
    return false;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Session: could not clear the session.', error);
  }
}

function getSession() {
  var session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (error) {
    session = null;
  }
  if (!session || typeof session !== 'object' || session.id === undefined) {
    return null;
  }
  /* The session must point at a real account. If the stored users were
     cleared, the session is stale, so treat the visitor as a guest. */
  var account = getById(TABLES.USERS, session.id);
  if (!account) {
    clearSession();
    return null;
  }
  /* The role always comes from the stored account, not from the session copy. */
  return { id: account.id, username: account.username, role: account.role };
}

function isAdmin() {
  var session = getSession();
  return session !== null && session.role === ROLE_ADMIN;
}

function isUser() {
  var session = getSession();
  return session !== null && session.role === ROLE_USER;
}

function homePageFor(role) {
  return role === ROLE_ADMIN ? 'adminevents.html' : 'events.html';
}
