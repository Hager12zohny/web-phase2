/* ==========================================================================
   
   The ONLY file in the project that touches localStorage.
   Tables: "users", "events", "registrations"  (each is a JSON array)
   Every record gets a system-generated numeric id (separate counter per table).

   Public functions (all global):
     getAll(table)                 -> array of records ([] if empty/corrupted)
     getById(table, id)            -> record or null          (id may be "5" or 5)
     insert(table, record)         -> the saved record (with new id) or null
     update(table, id, changes)    -> the updated record or null if not found
     remove(table, id)             -> true if deleted, false if not found
     find(table, predicate)        -> array of records where predicate(record) is true
     removeWhere(table, predicate) -> number of records deleted (for cascade delete)
   ========================================================================== */

var STORAGE_PREFIX = 'eventhub_';
var TABLES = { USERS: 'users', EVENTS: 'events', REGISTRATIONS: 'registrations' };

function _tableKey(table) {
  return STORAGE_PREFIX + 'table_' + table;
}

function _counterKey(table) {
  return STORAGE_PREFIX + 'next_id_' + table;
}

function _readTable(table) {
  try {
    var raw = localStorage.getItem(_tableKey(table));
    if (raw === null) {
      return [];
    }
    var data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Storage: table "' + table + '" is missing or corrupted, using an empty table.', error);
    return [];
  }
}

function _writeTable(table, rows) {
  try {
    localStorage.setItem(_tableKey(table), JSON.stringify(rows));
    return true;
  } catch (error) {
    console.error('Storage: could not save table "' + table + '".', error);
    return false;
  }
}

/* Next id = value of the table's own counter. If the counter is missing or
   damaged we rebuild it from the highest id already in the table, so ids
   are never reused. */
function _nextId(table, rows) {
  var highest = 0;
  for (var i = 0; i < rows.length; i++) {
    var current = Number(rows[i].id);
    if (current > highest) {
      highest = current;
    }
  }
  var counter = 0;
  try {
    counter = parseInt(localStorage.getItem(_counterKey(table)), 10);
  } catch (error) {
    counter = 0;
  }
  if (isNaN(counter) || counter <= highest) {
    counter = highest + 1;
  }
  try {
    localStorage.setItem(_counterKey(table), String(counter + 1));
  } catch (error) {
    console.error('Storage: could not save the id counter for "' + table + '".', error);
  }
  return counter;
}

function getAll(table) {
  return _readTable(table);
}

function getById(table, id) {
  var wanted = Number(id);
  var rows = _readTable(table);
  for (var i = 0; i < rows.length; i++) {
    if (Number(rows[i].id) === wanted) {
      return rows[i];
    }
  }
  return null;
}

function insert(table, record) {
  var rows = _readTable(table);
  var saved = Object.assign({}, record, { id: _nextId(table, rows) });
  rows.push(saved);
  return _writeTable(table, rows) ? saved : null;
}

function update(table, id, changes) {
  var wanted = Number(id);
  var rows = _readTable(table);
  for (var i = 0; i < rows.length; i++) {
    if (Number(rows[i].id) === wanted) {
      /* the id can never be changed through update() */
      rows[i] = Object.assign({}, rows[i], changes, { id: rows[i].id });
      return _writeTable(table, rows) ? rows[i] : null;
    }
  }
  return null;
}

function remove(table, id) {
  var wanted = Number(id);
  var rows = _readTable(table);
  var kept = rows.filter(function (row) {
    return Number(row.id) !== wanted;
  });
  if (kept.length === rows.length) {
    return false;
  }
  return _writeTable(table, kept);
}

function find(table, predicate) {
  return _readTable(table).filter(predicate);
}

function removeWhere(table, predicate) {
  var rows = _readTable(table);
  var kept = rows.filter(function (row) {
    return !predicate(row);
  });
  var removed = rows.length - kept.length;
  if (removed > 0 && !_writeTable(table, kept)) {
    return 0;
  }
  return removed;
}
