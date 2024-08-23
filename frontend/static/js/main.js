// frontend/static/js/main.js

document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');

    let names = [];
    let filteredNames = [];

    // Fetch the list of names from the backend
    fetch('/api/names')
        .then(response => response.json())
        .then(data => {
            names = data;
        });

    // Filter names based on the search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        filteredNames = names.filter(name => name.toLowerCase().includes(query));
        displaySuggestions();
    });

    // Display the filtered suggestions in the dropdown
    function displaySuggestions() {
        suggestionsList.innerHTML = '';
        if (filteredNames.length > 0) {
            filteredNames.forEach(name => {
                const listItem = document.createElement('li');
                listItem.textContent = name;
                listItem.addEventListener('click', function () {
                    bahnhofSuche.value = name;
                    suggestionsList.innerHTML = '';
                });
                suggestionsList.appendChild(listItem);
            });
        }
    }

    // Handle the search button click
    searchButton.addEventListener('click', function () {
        const query = bahnhofSuche.value.toLowerCase();
        alert('Searching for: ' + query);
        // Implement search functionality here if needed
    });
});


document.addEventListener('DOMContentLoaded', function () {
    var slider = document.getElementById('range-slider');

    noUiSlider.create(slider, {
        start: [20, 80], // Initial values for the two handles
        connect: true, // The bar will connect the handles
        range: {
            'min': 0,
            'max': 100
        }
    });

    // You can add event listeners here if you need to handle changes to the slider values
});