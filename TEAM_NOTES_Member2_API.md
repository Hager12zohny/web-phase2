# Shared foundation: what every member should call

Load order on EVERY page (already added to all pages):
```html
<script src="js/storage.js"></script>
<script src="js/session.js"></script>
<script src="js/guard.js"></script>
<script src="js/navbar.js"></script>
<script src="js/YOUR-PAGE.js"></script>   <!-- add after these four -->
```
Pages need: `<body data-access="public|guest-only|user|admin">`, `<header class="navbar" id="site-navbar"></header>`, `<footer class="footer" id="site-footer"></footer>`. Do not write your own navbar.

## Tables (use exactly these names) — constant TABLES.USERS / .EVENTS / .REGISTRATIONS
| table | fields |
|---|---|
| users | id, username, email, password, role (`"user"` or `"admin"`) |
| events | id, title, date (YYYY-MM-DD), location, category (Conference/Workshop/Meetup), numberOfSeats, description, createdBy |
| registrations | id, userId, eventId, registerDate, status (`"Pending"`/`"Accepted"`/`"Rejected"`), message |

## storage.js (only file that touches localStorage)
| call | returns |
|---|---|
| `getAll(table)` | array (empty if nothing/corrupted) |
| `getById(table, id)` | record or `null` (id can be a string from the URL) |
| `insert(table, record)` | saved record **with new id**, or `null` |
| `update(table, id, changes)` | updated record, or `null` if not found (id can't be changed) |
| `remove(table, id)` | `true` / `false` |
| `find(table, predicate)` | array of matches |
| `removeWhere(table, predicate)` | number deleted. **Member 4: use for cascade delete**, e.g. `removeWhere(TABLES.REGISTRATIONS, r => r.eventId === ev.id)` |

## session.js (sessionStorage only)
`getSession()` -> `{id, username, role}` or `null` · `saveSession(user)` · `clearSession()` · `isAdmin()` · `isUser()` · `homePageFor(role)`

Use `getSession().id` for `userId` / `createdBy`.

## Other helpers
- `form-ui.js`: `showInlineErrors(form)` shows validation messages under fields; `showFormMessage('error'|'success', text)` with `<div id="form-msg" class="form-msg"></div>`.
- CSS classes ready to use: `.empty-state`, `.result-count`, `.badge-pending/-accepted/-rejected`, `.badge-conference/-workshop/-meetup`, `.field-error`, `.is-invalid`.
- Always build DOM with `textContent` (not `innerHTML`) for user-entered text.
