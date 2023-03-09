// Define the URL of the CSV file
var url = 'flood_test.csv';

// Define an array to store the CSV data
var data = [];

// Use the Fetch API to read the CSV file and store its data in the array
fetch(url)
	.then(response => response.text())
	.then(text => {
		data = Papa.parse(text, { header: true }).data;
	        console.log(data); // add this line to check if data is loaded correctly
	});
console.log('JavaScript file loaded.');
// Get references to the form and the risk element
var form = document.querySelector('form');
var risk = document.getElementById('risk');

// Add an event listener to the form to handle submissions
form.addEventListener('submit', function(event) {
	event.preventDefault();
	var address = document.getElementById('address').value;
	console.log(address); // add this line to check if address is being retrieved correctly
	var match = data.find(row => row.Address === address);
	console.log(match); // add this line to check if match is being found correctly
	if (match) {
		risk.textContent = 'Risk: ' + match.Risk;
		risk.style.display = 'block';
	} else {
		risk.textContent = 'No match found';
		risk.style.display = 'block';
	}
});
