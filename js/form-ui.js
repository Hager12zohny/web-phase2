/* ==========================================================================
   
   Shows validation messages under each field instead of the browser bubble.
   Uses the browser's own validation rules (required, pattern, min, max ...)
   plus anything set with setCustomValidity().

   Usage:  showInlineErrors(formElement);
   ========================================================================== */

function _fieldLabel(field) {
  var label = field.id ? document.querySelector('label[for="' + field.id + '"]') : null;
  return label ? label.textContent.replace('*', '').trim() : 'This field';
}

function _fieldMessage(field) {
  var v = field.validity;
  if (v.customError) {
    return field.validationMessage;
  }
  if (v.valueMissing) {
    return field.tagName === 'SELECT' ? 'Choose an option for ' + _fieldLabel(field).toLowerCase() + '.'
                                      : _fieldLabel(field) + ' is required.';
  }
  if (v.typeMismatch) {
    return 'Enter a valid email address, like name@example.com.';
  }
  if (v.patternMismatch) {
    return field.title || 'Use the format shown for this field.';
  }
  if (v.tooShort) {
    return _fieldLabel(field) + ' must be at least ' + field.minLength + ' characters.';
  }
  if (v.tooLong) {
    return _fieldLabel(field) + ' must be at most ' + field.maxLength + ' characters.';
  }
  return field.validationMessage;
}

function _errorBox(field) {
  var group = field.closest('.form-group') || field.parentNode;
  var box = group.querySelector('.field-error');
  if (!box) {
    box = document.createElement('small');
    box.className = 'field-error';
    box.id = (field.id || field.name) + '-error';
    box.setAttribute('role', 'alert');
    group.appendChild(box);
  }
  return box;
}

function refreshFieldMessage(field) {
  var box = _errorBox(field);
  /* validity.valid, NOT checkValidity(): checkValidity() fires the 'invalid' event again (infinite loop) */
  if (field.validity.valid) {
    box.textContent = '';
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  } else {
    box.textContent = _fieldMessage(field);
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', box.id);
  }
}

function showInlineErrors(form) {
  var focused = false;

  form.addEventListener('invalid', function (event) {
    event.preventDefault();               /* hide the browser's own bubble */
    refreshFieldMessage(event.target);
    if (!focused) {                       /* focus only the first invalid field */
      focused = true;
      event.target.focus();
      setTimeout(function () { focused = false; }, 0);
    }
  }, true);

  /* Re-check a field as soon as the person edits it (only after it showed an error). */
  form.addEventListener('input', function (event) {
    if (event.target.classList.contains('is-invalid')) {
      refreshFieldMessage(event.target);
    }
  });
  form.addEventListener('change', function (event) {
    if (event.target.classList.contains('is-invalid')) {
      refreshFieldMessage(event.target);
    }
  });

  form.addEventListener('reset', function () {
    form.querySelectorAll('.is-invalid').forEach(function (field) {
      field.classList.remove('is-invalid');
      field.setCustomValidity('');
    });
    form.querySelectorAll('.field-error').forEach(function (box) {
      box.textContent = '';
    });
  });
}

/* Page-level message box: <div id="form-msg" class="form-msg"></div> */
function showFormMessage(kind, text) {
  var box = document.getElementById('form-msg');
  if (!box) {
    return;
  }
  box.className = 'form-msg ' + kind;
  box.textContent = text;
}

function hideFormMessage() {
  var box = document.getElementById('form-msg');
  if (box) {
    box.className = 'form-msg';
    box.textContent = '';
  }
}
