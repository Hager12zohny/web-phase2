/* ==========================================================================
   
   Fills the Home pages (index.html, userhome.html, adminhome.html) from storage.
   Nothing here is hardcoded sample data: everything comes from the events and
   registrations tables and the current session.
   ========================================================================== */

var CATEGORY_CLASSES = { conference: 'conference', workshop: 'workshop', meetup: 'meetup' };

function todayString() {
  var now = new Date();
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

function parseDay(dateString) {
  var parts = String(dateString).split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function prettyDate(dateString) {
  return parseDay(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function seatsLeftFor(event) {
  var accepted = find(TABLES.REGISTRATIONS, function (reg) {
    return Number(reg.eventId) === Number(event.id) && reg.status === 'Accepted';
  }).length;
  return Math.max(0, Number(event.numberOfSeats) - accepted);
}

function upcomingEvents() {
  var today = todayString();
  return getAll(TABLES.EVENTS)
    .filter(function (ev) { return ev.date >= today; })
    .sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
}

function node(tag, className, text) {
  var created = document.createElement(tag);
  if (className) { created.className = className; }
  if (text !== undefined) { created.textContent = text; }
  return created;
}

function addFact(parent, label, value) {
  var line = node('p');
  line.appendChild(node('strong', '', label + ' '));
  line.appendChild(document.createTextNode(value));
  parent.appendChild(line);
}

function buildEventCard(ev, role) {
  var card = node('article', 'event-card');
  var key = CATEGORY_CLASSES[String(ev.category).toLowerCase()] || 'conference';

  var image = node('div', 'card-img img-' + key);
  image.appendChild(node('span', 'tag', ev.category));
  card.appendChild(image);

  var body = node('div', 'event-card-body');
  body.appendChild(node('h3', '', ev.title));
  addFact(body, 'Date:', prettyDate(ev.date));
  addFact(body, 'Location:', ev.location);
  addFact(body, 'Seats left:', seatsLeftFor(ev) + ' of ' + ev.numberOfSeats);

  var action = node('a', 'btn btn-small');
  if (role === 'user') {
    action.textContent = 'View details';
    action.href = 'eventdetails.html?id=' + encodeURIComponent(ev.id);
  } else {
    action.textContent = 'Log in to register';
    action.href = 'login.html';
  }
  body.appendChild(action);
  card.appendChild(body);
  return card;
}

function buildArch(index, day, monthText, title, detail) {
  var arch = node('div', 'arch arch-' + index);
  arch.appendChild(node('span', 'big', day));
  arch.appendChild(node('span', 'small-text', monthText));
  var floating = node('div', 'float-card ' + (index === 1 ? 'float-gold' : 'float-mint'));
  floating.appendChild(node('strong', '', title));
  floating.appendChild(document.createTextNode(detail));
  arch.appendChild(floating);
  return arch;
}

function renderHeroActions(role) {
  var box = document.getElementById('hero-actions');
  if (!box) { return; }
  var sets = {
    guest: [['Create an account', 'signup.html', 'btn'], ['Log in', 'login.html', 'btn btn-outline']],
    user: [['Browse events', 'events.html', 'btn'], ['My registrations', 'myevents.html', 'btn btn-outline']],
    admin: [['Add new event', 'addevent.html', 'btn'], ['Review registrations', 'registrations.html', 'btn btn-outline']]
  };
  box.textContent = '';
  sets[role].forEach(function (item) {
    var link = node('a', item[2], item[0]);
    link.href = item[1];
    box.appendChild(link);
  });
}

function renderHeroText(role, session, upcoming) {
  var tag = document.getElementById('hero-tag');
  var title = document.getElementById('hero-title');
  var sub = document.getElementById('hero-sub');
  if (tag) {
    tag.textContent = upcoming.length > 0
      ? 'Next event on ' + prettyDate(upcoming[0].date)
      : 'No upcoming events yet';
  }
  if (role === 'user' && session) {
    if (title) { title.textContent = 'Welcome back, ' + session.username; }
    if (sub) { sub.textContent = 'Find an event, register for it, and check whether the organizer accepted your request.'; }
  } else if (role === 'admin' && session) {
    if (title) { title.textContent = 'Welcome back, ' + session.username; }
    if (sub) { sub.textContent = 'Add events, edit them, and review registration requests from users.'; }
  }
}

function renderHeroShapes(role, session, upcoming) {
  var shapes = document.getElementById('hero-shapes');
  if (!shapes) { return; }
  shapes.textContent = '';

  if (role === 'admin' && session) {
    var mine = find(TABLES.EVENTS, function (ev) { return Number(ev.createdBy) === Number(session.id); }).length;
    var pending = find(TABLES.REGISTRATIONS, function (reg) { return reg.status === 'Pending'; }).length;
    shapes.appendChild(buildArch(1, String(mine), 'EVENTS', 'Events', 'created by you'));
    shapes.appendChild(buildArch(2, String(pending), 'PENDING', 'Requests', 'waiting for you'));
    return;
  }

  if (upcoming.length === 0) {
    shapes.hidden = true;
    return;
  }
  shapes.hidden = false;
  upcoming.slice(0, 2).forEach(function (ev, i) {
    var date = parseDay(ev.date);
    var month = date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    shapes.appendChild(buildArch(i + 1, String(date.getDate()), month, ev.title, seatsLeftFor(ev) + ' seats left'));
  });
}

function renderFeatured(role, upcoming) {
  var grid = document.getElementById('featured-events');
  if (!grid) { return; }
  grid.textContent = '';

  if (upcoming.length === 0) {
    var empty = node('div', 'empty-state');
    empty.appendChild(node('h3', '', 'No upcoming events yet'));
    empty.appendChild(node('p', '', role === 'admin'
      ? 'Create the first event and it will appear here.'
      : 'Events will appear here as soon as an organizer publishes them.'));
    grid.classList.remove('card-grid');
    grid.appendChild(empty);
    return;
  }
  grid.classList.add('card-grid');
  upcoming.slice(0, 3).forEach(function (ev) {
    grid.appendChild(buildEventCard(ev, role));
  });
}

function renderSeeAll(role) {
  var link = document.getElementById('see-all');
  if (!link) { return; }
  if (role === 'user') {
    link.href = 'events.html';
    link.textContent = 'See all events';
  } else {
    link.href = 'login.html';
    link.textContent = 'Log in to see all events';
  }
}

(function initHome() {
  var session = getSession();
  var role = session ? session.role : 'guest';
  var upcoming = upcomingEvents();

  renderHeroText(role, session, upcoming);
  renderHeroActions(role);
  renderHeroShapes(role, session, upcoming);

  if (role !== 'admin') {
    renderFeatured(role, upcoming);
    renderSeeAll(role);
  }

  /* The sign-up call-to-action is only for visitors who are not logged in. */
  var cta = document.getElementById('guest-cta');
  if (cta && session) {
    cta.remove();
  }
})();
