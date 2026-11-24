/* ==========================================================================
   
   Checks the username + password against stored users.
   A wrong combination always shows the same generic message, so nobody can
   tell which of the two was wrong.
   ========================================================================== */

var loginForm = document.getElementById('login-form');
var loginUsername = document.getElementById('username');
var loginPassword = document.getElementById('password');

showInlineErrors(loginForm);

(function showNoticeFromUrl() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('registered') === '1') {
    showFormMessage('success', 'Account created. Log in to continue.');
  } else if (params.get('loggedout') === '1') {
    showFormMessage('success', 'You have been logged out.');
  }
})();

function findMatchingUser(username, password) {
  var wanted = username.trim().toLowerCase();
  var matches = find(TABLES.USERS, function (user) {
    return String(user.username).toLowerCase() === wanted && user.password === password;
  });
  return matches.length > 0 ? matches[0] : null;
}

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  hideFormMessage();

  var user = findMatchingUser(loginUsername.value, loginPassword.value);
  if (!user) {
    showFormMessage('error', 'Invalid username or password');
    loginPassword.value = '';
    loginPassword.focus();
    return;
  }

  saveSession(user);
  window.location.replace(homePageFor(user.role));
});
