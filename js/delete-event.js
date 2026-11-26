
 // Get the event ID from the URL
var params = new URLSearchParams(window.location.search);
var eventId = params.get("id");

// Get the selected event
var selectedEvent = getById(TABLES.EVENTS, eventId);

// Get the elements from the HTML page
var eventTitle = document.getElementById("delete-event-title");
var eventIdText = document.getElementById("delete-event-id");
var eventDate = document.getElementById("delete-event-date");
var eventLocation = document.getElementById("delete-event-location");

var confirmButton = document.getElementById("confirm-delete");
var messageBox = document.getElementById("delete-msg");

// Show messages to the user
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "form-msg " + type;
}

// Check if the event exists
if (!selectedEvent) {

    showMessage("Event not found.", "error");
    confirmButton.disabled = true;

} else {

    // Display the event information
    eventIdText.textContent = selectedEvent.id;
    eventTitle.textContent = selectedEvent.title;
    eventDate.textContent = selectedEvent.date;
    eventLocation.textContent = selectedEvent.location;

}

// Delete the event after confirmation
confirmButton.addEventListener("click", function() {

    if (!selectedEvent) {
        showMessage("Event not found.", "error");
        return;
    }

    // Ask the admin to confirm deletion
    var confirmDelete = confirm(
        "Are you sure you want to delete this event? All registrations for this event will also be deleted."
);

    if (!confirmDelete) {
        return;
    }

    // Delete all registrations related to this event
    removeWhere(TABLES.REGISTRATIONS, function(registration) {
        return String(registration.eventId) === String(eventId);
    });

    // Delete the event
    var result = remove(TABLES.EVENTS, eventId);

    if (result) {

        showMessage("Event deleted successfully!", "success");

        setTimeout(function() {
            window.location.href = "adminevents.html";
        }, 1000);

    } else {

        showMessage("Something went wrong. Please try again.", "error");

    }

});
