/* ==========================================================================
  
   Creates an account. Uses storage.js (find / insert) and form-ui.js.
   Rules:
     - username 3-20 letters/digits/underscores, unique (ignoring case)
     - email valid, unique (ignoring case)
     - password 8+ chars with upper-case, lower-case and a digit
     - confirm password must match
     - role: user or admin
   ========================================================================== */

var signupForm = document.getElementById('signup-form');
var usernameInput = document.getElementById('username');
var emailInput = document.getElementById('email');
var passwordInput = document.getElementById('password');
var confirmInput = document.getElementById('confirm_password');
var roleSelect = document.getElementById('role');

showInlineErrors(signupForm);

function sameText(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function usernameIsTaken(name) {
  return find(TABLES.USERS, function (user) {
    return sameText(user.username, name);
  }).length > 0;
}

function emailIsTaken(email) {
  return find(TABLES.USERS, function (user) {
    return sameText(user.email, email);
  }).length > 0;
}

/* Every check clears its previous custom message first, then sets a new one if needed. */
function checkUsernameUnique() {
  usernameInput.setCustomValidity('');
  if (usernameInput.validity.valid && usernameIsTaken(usernameInput.value)) {
    usernameInput.setCustomValidity('This username is already taken. Choose another one.');
  }
}

function checkEmailUnique() {
  emailInput.setCustomValidity('');
  if (emailInput.validity.valid && emailIsTaken(emailInput.value)) {
    emailInput.setCustomValidity('An account with this email already exists. Log in instead.');
  }
}

function checkPasswordsMatch() {
  if (confirmInput.value !== passwordInput.value) {
    confirmInput.setCustomValidity('Passwords do not match.');
  } else {
    confirmInput.setCustomValidity('');
  }
  /* Show or clear the mismatch message on the confirm field as soon as it has text. */
  if (confirmInput.value !== '' || confirmInput.classList.contains('is-invalid')) {
    refreshFieldMessage(confirmInput);
  }
}

usernameInput.addEventListener('input', checkUsernameUnique);
emailInput.addEventListener('input', checkEmailUnique);
passwordInput.addEventListener('input', checkPasswordsMatch);   /* re-check when EITHER field changes */
confirmInput.addEventListener('input', checkPasswordsMatch);

signupForm.addEventListener('submit', function (event) {
  event.preventDefault();

  /* Re-run every check at the moment of saving (the users table may have changed). */
  checkUsernameUnique();
  checkEmailUnique();
  checkPasswordsMatch();
  if (!signupForm.checkValidity()) {
    signupForm.reportValidity();
    return;
  }

  var saved = insert(TABLES.USERS, {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: roleSelect.value
  });

  if (!saved) {
    showFormMessage('error', 'Your account could not be saved. Check that browser storage is enabled and try again.');
    return;
  }
  window.location.href = 'login.html?registered=1';
});
