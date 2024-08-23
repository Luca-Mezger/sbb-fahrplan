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

    // Initialize the slider
    var slider = document.getElementById('range-slider');
    var startTimeDisplay = document.getElementById('start-time-display');
    var endTimeDisplay = document.getElementById('end-time-display');

    noUiSlider.create(slider, {
        start: [0, 12], // Initial values for the two handles (00:00 to 12:00)
        connect: true, 
        step: 1, 
        range: {
            'min': 0,
            'max': 23 
        },
        format: {
            to: function(value) {
                return ('0' + Math.floor(value)).slice(-2) + ":00";
            },
            from: function(value) {
                return Number(value.replace(":00", ""));
            }
        }
    });

    // Update display when slider values change
    slider.noUiSlider.on('update', function(values, handle) {
        if (handle === 0) {
            startTimeDisplay.textContent = values[0];
        } else {
            endTimeDisplay.textContent = values[1];
        }
    });

    // Button click event listeners
    document.getElementById('morning-button').addEventListener('click', function() {
        slider.noUiSlider.set([0, 12]); // Set slider to 00:00 - 12:00
    });

    document.getElementById('midday-button').addEventListener('click', function() {
        slider.noUiSlider.set([10, 15]); // Set slider to 10:00 - 15:00
    });

    document.getElementById('evening-button').addEventListener('click', function() {
        slider.noUiSlider.set([16, 23]); // Set slider to 16:00 - 23:00
    });
});
