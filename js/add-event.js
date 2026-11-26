
var addForm = document.getElementById("add-event-form");

var titleInput = document.getElementById("title");
var dateInput = document.getElementById("date");
var locationInput = document.getElementById("location");
var categoryInput = document.getElementById("category");
var seatsInput = document.getElementById("seats");
var descriptionInput = document.getElementById("description");

var messageBox = document.getElementById("form-msg");

// Get today's date
var today = new Date();
var todayText = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

// New events must be today or in the future
dateInput.min = todayText;

// Show messages to the user
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "form-msg " + type;
}

// Check if an event already exists
function eventExists(title, date, location) {
    var events = getAll(TABLES.EVENTS);

    for (var i = 0; i < events.length; i++) {
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

// Add a new event
addForm.addEventListener("submit", function(event) {
    event.preventDefault();

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
    if (date === "" || date < todayText) {
        showMessage("Please choose today or a future date.", "error");
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

    // Check if the event already exists
    if (eventExists(title, date, location)) {
        showMessage("This event already exists.", "error");
        return;
    }

    // Get the logged-in admin
    var currentUser = getSession();

    if (!currentUser) {
        showMessage("Please login first.", "error");
        return;
    }

    // Create the new event
    var newEvent = {
        title: title,
        date: date,
        location: location,
        category: category,
        numberOfSeats: seats,
        description: description,
        createdBy: currentUser.id
    };

    // Save the event
    var result = insert(TABLES.EVENTS, newEvent);

    if (result) {
        showMessage("Event added successfully!", "success");
        addForm.reset();

        setTimeout(function() {
            window.location.href = "adminevents.html";
        }, 1000);
    } else {
        showMessage("Something went wrong. Please try again.", "error");
    }
});
