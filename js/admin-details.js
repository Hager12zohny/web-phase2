
// Get the event ID from the URL
var params = new URLSearchParams(window.location.search);
var eventId = params.get("id");

// Get the selected event from localStorage
var selectedEvent = getById(TABLES.EVENTS, eventId);

// Check if the event exists
if (!selectedEvent) {

    document.querySelector(".details-box").textContent =
        "Sorry, this event does not exist.";

} else {

    // Display the event title
    document.getElementById("details-title").textContent =
        selectedEvent.title;

    // Display the event category
    document.getElementById("details-category").textContent =
        selectedEvent.category;

    document.getElementById("details-category").className =
        "badge badge-" + selectedEvent.category.toLowerCase();

    // Display the event ID
    document.getElementById("details-id").textContent =
        selectedEvent.id;

    // Display the event date
    document.getElementById("details-date").textContent =
        selectedEvent.date;

    // Display the event location
    document.getElementById("details-location").textContent =
        selectedEvent.location;

    // Display the category in the table
    document.getElementById("details-category-text").textContent =
        selectedEvent.category;

    // Display the number of seats
    document.getElementById("details-seats").textContent =
        selectedEvent.numberOfSeats;

    // Display the event description
    document.getElementById("details-description").textContent =
        selectedEvent.description;

    // Set the Edit button link
    document.getElementById("details-edit").href =
        "editevent.html?id=" + selectedEvent.id;

    // Set the Delete button link
    document.getElementById("details-delete").href =
        "deleteevent.html?id=" + selectedEvent.id;
}
