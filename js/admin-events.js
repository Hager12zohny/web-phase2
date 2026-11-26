
// Get the table body from the HTML page
var eventsTable = document.getElementById("events-table-body");

// Get all events from localStorage
var events = getAll(TABLES.EVENTS);

// Remove old rows before displaying the events
eventsTable.innerHTML = "";

// Check if there are no events
if (events.length === 0) {

    var row = document.createElement("tr");
    var cell = document.createElement("td");

    cell.colSpan = 7;
    cell.textContent = "No events found.";

    row.appendChild(cell);
    eventsTable.appendChild(row);

}

// Display all events in the table
else {

    events.forEach(function(event) {

        var row = document.createElement("tr");

        row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.title}</td>
            <td>${event.date}</td>
            <td>${event.location}</td>
            <td>${event.category}</td>
            <td>${event.numberOfSeats}</td>
            <td>
                <a href="admindetails.html?id=${event.id}" class="btn btn-small">View</a>
                <a href="editevent.html?id=${event.id}" class="btn btn-small">Edit</a>
                <a href="deleteevent.html?id=${event.id}" class="btn btn-small btn-danger">Delete</a>
            </td>
        `;

        eventsTable.appendChild(row);

    });

}
