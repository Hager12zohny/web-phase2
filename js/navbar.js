/* ==========================================================================
   
   Builds the one shared navbar and footer from the current session role.
   Pages only contain:  <header class="navbar" id="site-navbar"></header>
                        <footer class="footer" id="site-footer"></footer>
   Edit the NAV_LINKS table below to change links for a role.
   ========================================================================== */

var NAV_LINKS = {
  guest: [
    { label: 'Home', href: 'index.html' },
    { label: 'Login', href: 'login.html', style: 'outline' },
    { label: 'Sign up', href: 'signup.html', style: 'fill' }
  ],
  user: [
    { label: 'Home', href: 'userhome.html' },
    { label: 'Events', href: 'events.html' },
    { label: 'My Registrations', href: 'myevents.html' }
  ],
  admin: [
    { label: 'Home', href: 'adminhome.html' },
    { label: 'Events', href: 'adminevents.html' },
    { label: 'Add Event', href: 'addevent.html' },
    { label: 'Registrations', href: 'registrations.html' }
  ]
};

/* Pages that belong to a nav link even though their file name differs. */
var NAV_ALSO_ACTIVE = {
  'eventdetails.html': 'events.html',
  'register.html': 'events.html',
  'search.html': 'events.html',
  'admindetails.html': 'adminevents.html',
  'editevent.html': 'adminevents.html',
  'deleteevent.html': 'adminevents.html'
};

function _el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function _currentPage() {
  var name = window.location.pathname.split('/').pop();
  return name === '' ? 'index.html' : name;
}

function buildNavbar() {
  var header = document.getElementById('site-navbar');
  if (!header) {
    return;
  }
  var session = getSession();
  var role = session ? session.role : 'guest';
  var page = _currentPage();
  var activePage = NAV_ALSO_ACTIVE[page] || page;

  header.textContent = '';
  var inner = _el('div', 'inner');

  /* brand */
  var brand = _el('a', 'brand');
  brand.href = NAV_LINKS[role][0].href;
  var logo = _el('img', 'logo-img');
  logo.src = 'images/logo-cropped.png';
  logo.alt = '';
  brand.appendChild(logo);
  brand.appendChild(_el('span', 'brand-name', 'EventHub'));
  inner.appendChild(brand);

  /* mobile menu button */
  var toggle = _el('button', 'nav-toggle', 'Menu');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'site-nav-list');
  inner.appendChild(toggle);

  /* links */
  var nav = _el('nav');
  nav.setAttribute('aria-label', 'Main');
  var list = _el('ul');
  list.id = 'site-nav-list';

  NAV_LINKS[role].forEach(function (link) {
    var item = _el('li');
    var anchor = _el('a', '', link.label);
    anchor.href = link.href;
    if (link.style) {
      anchor.className = 'nav-btn nav-' + link.style;
    }
    if (link.href === activePage) {
      anchor.classList.add('active');
      anchor.setAttribute('aria-current', 'page');
    }
    item.appendChild(anchor);
    list.appendChild(item);
  });

  /* logged-in extras: who is signed in + Logout */
  if (session) {
    var who = _el('li', 'nav-user');
    who.appendChild(_el('span', 'role-tag role-' + role, role === 'admin' ? 'Administrator' : 'User'));
    who.appendChild(_el('span', 'nav-username', session.username));
    list.appendChild(who);

    var out = _el('li');
    var logout = _el('button', 'nav-btn nav-outline nav-logout', 'Logout');
    logout.type = 'button';
    logout.addEventListener('click', logoutAndRedirect);
    out.appendChild(logout);
    list.appendChild(out);
  }

  nav.appendChild(list);
  inner.appendChild(nav);
  header.appendChild(inner);

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function logoutAndRedirect() {
  clearSession();
  window.location.href = 'login.html?loggedout=1';
}

function buildFooter() {
  var footer = document.getElementById('site-footer');
  if (!footer) {
    return;
  }
  footer.textContent = '';
  var content = _el('div', 'container footer-content');

  var brand = _el('div', 'footer-brand');
  var logo = _el('img', 'logo-img');
  logo.src = 'images/logo-cropped.png';
  logo.alt = '';
  brand.appendChild(logo);
  brand.appendChild(_el('span', '', 'EventHub'));
  content.appendChild(brand);

  var links = _el('div', 'footer-links');
  var mail = _el('a', '', 'eventhub@gmail.com');
  mail.href = 'mailto:eventhub@gmail.com';
  links.appendChild(mail);
  ['Contact Us', 'Privacy Policy', 'Terms of Service'].forEach(function (label) {
    var anchor = _el('a', '', label);
    anchor.href = '#';
    links.appendChild(anchor);
  });
  content.appendChild(links);
  footer.appendChild(content);
}

buildNavbar();
buildFooter();

window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    buildNavbar();
  }
});
