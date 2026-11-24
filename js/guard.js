

function runPageGuard() {
  var access = document.body.getAttribute('data-access') || 'public';
  var session = getSession();
  var target = null;

  if (access === 'guest-only') {
    if (session) {
      target = homePageFor(session.role);
    }
  } else if (access === 'user' || access === 'admin') {
    if (!session) {
      target = 'login.html';
    } else if (session.role !== access) {
      target = homePageFor(session.role);
    }
  }

  if (target) {
    document.body.classList.remove('guard-ok');
    window.location.replace(target);
    return false;
  }
  document.body.classList.add('guard-ok');
  return true;
}

runPageGuard();

/* Back/forward cache: after Logout, pressing Back must not show a protected page. */
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    runPageGuard();
  }
});
