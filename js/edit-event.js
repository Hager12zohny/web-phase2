
// Get the form and its inputs
var editForm = document.getElementById("edit-event-form");

var titleInput = document.getElementById("title");
var dateInput = document.getElementById("date");
var locationInput = document.getElementById("location");
var categoryInput = document.getElementById("category");
var seatsInput = document.getElementById("seats");
var descriptionInput = document.getElementById("description");

var messageBox = document.getElementById("form-msg");

// Get the event ID from the URL
var params = new URLSearchParams(window.location.search);
var eventId = params.get("id");

// Get the selected event
var selectedEvent = getById(TABLES.EVENTS, eventId);

// Show messages to the user
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "form-msg " + type;
}

// Check if the event exists
if (!selectedEvent) {

    showMessage("Event not found.", "error");
    editForm.style.display = "none";

} else {

    // Display the current event data in the form
    titleInput.value = selectedEvent.title;
    dateInput.value = selectedEvent.date;
    locationInput.value = selectedEvent.location;
    categoryInput.value = selectedEvent.category;
    seatsInput.value = selectedEvent.numberOfSeats;
    descriptionInput.value = selectedEvent.description;

}

// Check if another event has the same title, date and location
function eventExists(title, date, location) {

    var events = getAll(TABLES.EVENTS);

    for (var i = 0; i < events.length; i++) {

        // Skip the event currently being edited
        if (String(events[i].id) === String(eventId)) {
            continue;
        }

        if (
            events[i].title.toLowerCase() === title.toLowerCase() &&
            events[i].date === date &&
            events[i].location.toLowerCase() === location.toLowerCase()
        ) {
            return true;
        }
    }

    return false;
}

// Count accepted registrations for this event
function getAcceptedRegistrations() {

    var registrations = find(TABLES.REGISTRATIONS, function(registration) {
        return (
            String(registration.eventId) === String(eventId) &&
            registration.status === "Accepted"
        );
    });

    return registrations.length;
}

// Update the event
editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get the new values from the form
    var title = titleInput.value.trim();
    var date = dateInput.value;
    var location = locationInput.value.trim();
    var category = categoryInput.value;
    var seats = Number(seatsInput.value);
    var description = descriptionInput.value.trim();

    // Check title
    if (title.length < 3 || title.length > 80) {
        showMessage("Title must be between 3 and 80 characters.", "error");
        return;
    }

    // Check date
    if (date === "") {
        showMessage("Please choose an event date.", "error");
        return;
    }

    // Check location
    if (location.length < 2 || location.length > 60) {
        showMessage("Location must be between 2 and 60 characters.", "error");
        return;
    }

    // Check category
    if (
        category !== "Conference" &&
        category !== "Workshop" &&
        category !== "Meetup"
    ) {
        showMessage("Please choose a valid category.", "error");
        return;
    }

    // Check number of seats
    if (!Number.isInteger(seats) || seats < 1 || seats > 10000) {
        showMessage("Seats must be between 1 and 10000.", "error");
        return;
    }

    // Check description
    if (description.length < 20 || description.length > 500) {
        showMessage("Description must be between 20 and 500 characters.", "error");
        return;
    }

    // Check for duplicate events
    if (eventExists(title, date, location)) {
        showMessage("Another event with the same details already exists.", "error");
        return;
    }

    // Check accepted registrations
    var acceptedCount = getAcceptedRegistrations();

    if (seats < acceptedCount) {
        showMessage(
            "Seats cannot be less than the accepted registrations (" + acceptedCount + ").",
            "error"
        );
        return;
    }

    // Save the updated event data
    var updatedEvent = {
        title: title,
        date: date,
        location: location,
        category: category,
        numberOfSeats: seats,
        description: description,
        createdBy: selectedEvent.createdBy
    };

    var result = update(TABLES.EVENTS, eventId, updatedEvent);

    if (result) {

        showMessage("Event updated successfully!", "success");

        setTimeout(function() {
            window.location.href = "adminevents.html";
        }, 1000);

    } else {

        showMessage("Something went wrong. Please try again.", "error");

    }

});
