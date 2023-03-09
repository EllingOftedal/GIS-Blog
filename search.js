// Define the URL of the CSV file
var url = 'flood_test.csv';

// Define an array to store the CSV data
var data = [];

// Use the Fetch API to read the CSV file and store its data in the array
fetch(url)
	.then(response => response.text())
	.then(text => {
		data = Papa.parse(text, { header: true }).data;
	});

// Get references to the form and the risk element
var form = document.querySelector('form');
var risk = document.getElementById('risk');

// Add an event listener to the form to handle submissions
form.addEventListener('submit', function(event) {
	event.preventDefault();
	var address = document.getElementById('address').value;
	// Remove extra whitespace characters from the input address
	address = address.replace(/ {2,}/g, ' ').trim();
	// Remove commas from the input address
	address = address.replace(/,\s*|\s*,/g, '');
	// Convert to lowercase
	address = address.toLowerCase();
	var match = data.find(row => {
		// Remove leading/trailing whitespace and commas, and convert to lowercase for each row's address value
		var rowAddress = row.Address.replace(/,/g, '').trim().toLowerCase();
		// Check if the row address contains the input address
		return rowAddress.includes(address);
	});
	if (match) {
		risk.textContent = 'Risk: ' + match.Risk;
		risk.style.display = 'block';
	} else {
		risk.textContent = 'No match found';
		risk.style.display = 'block';
	}
});
